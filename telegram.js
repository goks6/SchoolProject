const TelegramBot = require('node-telegram-bot-api');

// Create bot instance
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.warn('⚠️ Telegram Bot Token not found. Telegram notifications will be disabled.');
}

const bot = token ? new TelegramBot(token, { polling: true }) : null;

if (bot) {
    // Handle /start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const welcomeMessage = `
🙏 नमस्कार!
मी तुमच्या शाळेचा Attendance Bot आहे.

तुमच्या मुलाच्या शाळेतील माहिती मिळवण्यासाठी तुमचा मोबाईल नंबर नोंदणीकृत करा.

कृपया तुमचा 10 अंकी मोबाईल नंबर पाठवा:
(उदा: 9876543210)
        `;
        bot.sendMessage(chatId, welcomeMessage);
    });

    // Handle mobile number registration
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        
        // Skip if it's a command
        if (text && text.startsWith('/')) return;
        
        // Check if it's a mobile number
        if (/^\d{10}$/.test(text)) {
            const db = require('./database');
            try {
                // Update student record with Telegram ID
                const [result] = await db.execute(
                    'UPDATE students SET parent_telegram_id = ? WHERE parent_mobile = ?',
                    [chatId.toString(), text]
                );
                
                if (result.affectedRows > 0) {
                    bot.sendMessage(chatId, 
                        `✅ तुमचा मोबाईल नंबर ${text} यशस्वीरित्या नोंदणीकृत झाला!\n\n` +
                        `आता तुम्हाला तुमच्या मुलाच्या हजेरी आणि शाळेच्या सूचना या Telegram द्वारे मिळतील.`
                    );
                } else {
                    bot.sendMessage(chatId, 
                        `❌ हा मोबाईल नंबर आमच्या यादीत नाही.\n\n` +
                        `कृपया शाळेत नोंदणीकृत मोबाईल नंबर वापरा किंवा तुमच्या शाळेशी संपर्क साधा.`
                    );
                }
            } catch (error) {
                console.error('Telegram registration error:', error);
                bot.sendMessage(chatId, '❌ नोंदणी करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.');
            }
        } else if (text && text.length > 0) {
            bot.sendMessage(chatId, 
                '⚠️ कृपया फक्त 10 अंकी मोबाईल नंबर पाठवा.\n' +
                'उदा: 9876543210'
            );
        }
    });

    // Handle /help command
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        const helpMessage = `
📚 मदत:

1. /start - नोंदणी प्रक्रिया सुरू करा
2. /help - मदत संदेश
3. /status - तुमची नोंदणी स्थिती

तुमचा मोबाईल नंबर नोंदणीकृत केल्यानंतर तुम्हाला मिळेल:
- दैनंदिन हजेरी अपडेट
- अभ्यास आणि गृहपाठ
- शाळेच्या महत्वाच्या सूचना

कोणतीही समस्या असल्यास तुमच्या शाळेशी संपर्क साधा.
        `;
        bot.sendMessage(chatId, helpMessage);
    });

    // Handle /status command
    bot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        const db = require('./database');
        
        try {
            const [students] = await db.execute(
                'SELECT name, class, division FROM students WHERE parent_telegram_id = ?',
                [chatId.toString()]
            );
            
            if (students.length > 0) {
                let statusMessage = '✅ तुमची नोंदणी स्थिती:\n\n';
                students.forEach(student => {
                    statusMessage += `👦 ${student.name}\n`;
                    statusMessage += `📚 इयत्ता: ${student.class}-${student.division}\n\n`;
                });
                bot.sendMessage(chatId, statusMessage);
            } else {
                bot.sendMessage(chatId, 
                    '❌ तुमचा मोबाईल नंबर अद्याप नोंदणीकृत नाही.\n\n' +
                    '/start द्वारे नोंदणी करा.'
                );
            }
        } catch (error) {
            console.error('Status check error:', error);
            bot.sendMessage(chatId, '❌ स्थिती तपासताना त्रुटी.');
        }
    });

    console.log('✅ Telegram Bot is active');
} else {
    console.log('⚠️ Telegram Bot is disabled (no token provided)');
}

module.exports = bot;
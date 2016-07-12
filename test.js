var builder = require('botbuilder');
var restify = require('restify');
var content = require("content.json");

//=========================================================
// Bot Setup
//=========================================================
  
// Create bot and setup server
var connector = new builder.ChatConnector({
    appId: "89b2130c-d325-4ef4-9f49-6b3873ad6747",
    appPassword: "HL2LjDUFUGxyYgbfyPqxNGE"
});
var bot = new builder.UniversalBot(connector);

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.verifyBotFramework(), connector.listen());
server.listen(process.env.port || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existign conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        // Welcome mat and new user guidance
        var card = new builder.HeroCard(session)
            .title("Hi, I'm Idle Bot")
            .text("I deliver content based on the amount of idle time you have.")
            .images([
                 builder.CardImage.create(session, "http://collinferry.com/chat/img/idle_bot_hi.png")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Someone's going to be late for a Skype call again? I'm here to help!");
        session.beginDialog('/menu');
    },
    function (session, results) {
        // Bid farewell after delivering content
        session.send("Thanks for idling - come chat again when you've got more idle time.");
        session.send("Send feedback to collin.ferry@gmail.com.");
    }
]);

bot.dialog('/menu', [
    function (session, results) {
        builder.Prompts.number(session, "How much time do you have? (enter a number in minutes)"); 
    },
    function (session, results) {
        session.userData.time = results.response;
        session.beginDialog('/content');
    }
]);

bot.dialog('/content', [
    function (session) {
        if (session.userData.time < 3){session.send("Wow you're in a rush! I don't think I have anything that short yet, but...");}
        if (session.userData.time > 30){session.send("Wow, you've got plenty of time! I'm only one day old...so these long times don't match perfectly yet.");}
        session.send("Here are some great options:");
                
        //run code to choose 3 pieces of content

        var one = Math.floor(Math.random() * 47);
        var two = Math.floor(Math.random() * 47);
        var three = Math.floor(Math.random() * 47);
        if (session.userData.time === 5) { one=18; two=28; three=5; } else if (session.userData.time === 20) { one=44; two=23; three=38;} 
        var first = content[one];
        var second = content[two];
        var third = content[three];
        
        //display content carousel

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title(first.resolved_title + " (" + session.userData.time + " minutes)")
                    .text(first.excerpt)
                    .images([
                        builder.CardImage.create(session, "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=" + first.image + "&container=focus&resize_w=400&refresh=2592000")
                            .tap(builder.CardAction.showImage(session, first.image)),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, first.url, "Read this")
                    ]),
                new builder.HeroCard(session)
                    .title(second.resolved_title + " (" + session.userData.time + " minutes)")
                    .text(second.excerpt)
                    .images([
                        builder.CardImage.create(session, "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=" + second.image + "&container=focus&resize_w=400&refresh=2592000")
                            .tap(builder.CardAction.showImage(session, second.image)),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, second.url, "Read this")
                    ]),
                new builder.HeroCard(session)
                    .title(third.resolved_title + " (" + session.userData.time + " minutes)")
                    .text(third.excerpt)
                    .images([
                        builder.CardImage.create(session, "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?url=" + third.image + "&container=focus&resize_w=400&refresh=2592000")
                            .tap(builder.CardAction.showImage(session, third.image)),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, third.url, "Read this")
                    ])
            ]);
            session.endDialog(msg);
    }
]); 
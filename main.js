import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import  sqlite3  from 'sqlite3';
import run from './checkers_database.js';




const db = new sqlite3.Database('data.db'); 

const token = 'token';
const bot = new TelegramBot(token, {polling: true });

var startApp = true
var numBool = true
var arrBool = [ false , false , false , false , false ]

var text_wellcom = "";
fs.readFile("wellcom.txt" ,async (err , data)=>{
  text_wellcom = await data.toString();
})

db.serialize(() => {

    db.run('CREATE TABLE IF NOT EXISTS sites (id INTEGER PRIMARY KEY, site TEXT)');
})



bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId , text_wellcom , 
    {
        reply_markup:{
            "keyboard":[
            ["add" , "rm" ],
        ["check" , "list"],
        ['show-notif' , 'help?']
        ]
    }
    }
    )
    console.log(chatId)
});

bot.on("message" , async(msg)=>{
    const id = msg.chat.id
    var text = await msg.text

if(numBool){
 switch (text) {

    case "add":
        bot.sendMessage(id , 'type the address: ' )

       numBool = false
       arrBool[0] = true
        break;

    case "rm":

        bot.sendMessage(id , 'type the number: ')
        numBool = false
        arrBool[1] = true
        break;

    

    case "check":
        bot.sendMessage(id , 'type the number of list or address: ')
        numBool = false
        arrBool[2] = true
        break;

    case "list":
       list()
        break;

    case "show-notif":
        break;

    case "/start":
        break;
    

    default:
        bot.sendMessage(id , text_wellcom)
    }  

 } else {
    for(var i in arrBool){
        if(arrBool[i] == true){
            switch (i){
                case "0":

                    add()
                    arrBool[i] = false;

                    break;
                case "1":
                    rm()
                    arrBool[i] = false;
                    break
                
                case "2":
                    check()
                    arrBool[i] = false;
                    break;

                
                    
                case "5":
                    arrBool[i] = false;
                    break
                case "6":
                    arrBool[i] = false;
                    break

            }
        }
    }




    numBool = true
 }
    function  add(){

        if(text.slice(0 , 8) == "https://" || text.slice(0 , 7) == "http://"){
        const stmt = db.prepare('INSERT INTO sites (site) VALUES (?)');
        db.serialize(()=>{

            stmt.run(text.toString())

        })
        /*
        datas['links-web'].push(text.toString())
        bot.sendMessage(id , "successful!")

        */
        
        bot.sendMessage(id , "successful!")
        list()
    } else {
        bot.sendMessage(id , "`invalid URL! (EX: http https:// + yourlink.com)`" , { parse_mode:"Markdown"})

    }
    }  



    function rm(){
        var query = "DELETE FROM sites WHERE id = ?"
        var textint = 0 ;
        if(Number.isInteger(parseInt(text , 10))){
            textint = text;
        
        db.serialize(()=>{


            db.run(query , textint , (err)=>{
                if(err){
                    console.error(err)
                }
            } )
            textint = 0
        })
        bot.sendMessage(id , "successful!")
        list()


    }else{
        bot.sendMessage(id , "input is't number")
    }
       
    }
 


    function check(){
    var dataSend = ''

    if(text.slice(0 , 8) == "https://" || text.slice(0 , 7) == "http://"){

        
            
 
            bot.sendMessage(id , "by address checked! pleas wait")
           run(text).then(data=> {
            dataSend = '`' + data + '`'
            bot.sendMessage(id , dataSend , { parse_mode: 'Markdown' })
           }) 

        
    }
    else{
        bot.sendMessage(id , "`invalid URL! (EX: http https:// + yourlink.com)`" , { parse_mode:"Markdown"})
    }

    }
 
    var arrlist = []
    var arrlist2 = []
    function readFromDataBase(){
        return new Promise((resolve, reject) => {
        db.serialize(  ()=>{
          
            db.each('SELECT * FROM sites',  (err, row) => {
            if (err) {
              console.error(err.message);
            }
            arrlist.push((row.id + "-> " + "`" + row.site + "`").toString())
            resolve(arrlist)
            
            
        })
              
          
          
          });
          
        });
    
}
    function readFromDataBaseC(){
        arrlist2 = []
        return new Promise((resolve, reject) => {
            db.serialize(  ()=>{
                db.each('SELECT * FROM sites',  (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }
                    arrlist2.push(row.site)
                    resolve(arrlist2)
                    
                })
            });
        });
    }

    async function autoCheck() {
        setInterval(async () => {
            var dataSend = '';
            try {
                const data = await readFromDataBaseC();
                console.log(data)
                for (var i = 0; i < data.length; i++) {
                    dataSend = '';
                    
    
                    const dataBack = await run(data[i]);
    
                    // check if dataBack have '#'
                    const regex = /#/;
                    if (regex.test(dataBack)) {
                        dataSend = '`' + data[i] + '`' + ": \n" + '`' + dataBack + '`';
                        bot.sendMessage(id , dataSend , { parse_mode: 'Markdown' });

                    } else {
                        dataSend = '`' + data[i] + '`' + ": \n" + '`' + dataBack + '`';
                        console.log(dataSend);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            }
            startApp = true
        }, 5000000);  // 3600000    -> one hour
    }
    
    if(startApp) {
            
        autoCheck();
        startApp = false
    }

    



    function  list(){
        var strlist = ""
        readFromDataBase().then(data =>{
    
            for(var i in data){
                strlist = strlist + data[i]+ "\n"
            }
            bot.sendMessage(id,strlist , { parse_mode: 'Markdown' });
            arrlist = []
        })
    }

    function show_notif(){}



    })




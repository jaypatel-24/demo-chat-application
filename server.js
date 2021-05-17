const express = require('express')
const mongoose = require('mongoose')
const app = express()
const connectDB =  require('./config/db')

var http = require('http').Server(app)
var io = require('socket.io')(http)

//connect database
connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname))


const MessageSchema = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    message : {
        type: String,
        required: true
    }
});

const Message = mongoose.model('Message', MessageSchema)



var messages = [
    {
        name: "Jay",
        message: "Hey Aditi, how are you?"
    },
    {
        name: "Aditi",
        message: "I am fine, what about you?"
    }
]

app.get('/messages', (req,res) => {
   Message.find((err, message) => {
       res.send(message);
   })
})

app.post('/messages', async (req,res) => {
    const { name, message} = req.body; 

    try {
        let new_message = new Message({
            name,
            message
        });
    
        await new_message.save();
    
        let censored =  await Message.findOne({ message: 'badword'}); 
        if(censored) {
            await Message.remove({_id: censored.id })
        } else {
            io.emit('message', req.body)
            res.sendStatus(200);  
        }
    } catch (err) {
        console.error(err.message)
        res.sendStatus(500)
    }    
})

app.get('/messages/:user', async (req,res) => {
    const user = req.params.user
    Message.find({ name: user }, (err, messages) => {
        res.send(messages);
    });
})

io.on('connection', (socket) => {
    console.log('user connected')
})


var server = http.listen(3000, () => {
    console.log('server is listening on port' , server.address().port)
})


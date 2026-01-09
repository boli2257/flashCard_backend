import express from "express"
import jwt from "jsonwebtoken"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

dotenv.config()
const app = express()

app.use(cors({
    origin:process.env.FRONTEND_URL, //frontend cime
    credentials: true // engedélyezzük a sütik közlekedését
}))
app.use(express.json())
app.use(cookieParser())
//a HTML  cookie: Cookie: theme=dark token=2adfobnoae
//request.cookie={theme:"...",token:"..."}

app.post("/login",(req,res)=>{
    const {key} = req.body
    if(key!==process.env.AUTH_KEY) return res.status(401).json({error:"Hibás kulcs!"})
        const token = jwt.sign({access:true}, process.env.JWT_SECRET, {expiresIn:"2h"})
        const isProd=process.env.NODE_ENV == "production";
    res.cookie("token",token,{
        httpOnly:true,//a JS nem fér hozzá
        secure:isProd, //prod-ban true : https
        sameSite:isProd? "none":"strict",
        maxAge:2*60*60*1000,//2 órát él
    })
    res.sendStatus(200)
    
})
//get végpont: ami csak akkor ad választ ha a kérdéshez érvényes JWT token tartozik
app.get("/protected",(req,res)=>{
    try {
        const token = req.cookies.token
        if(!token) throw new Error()
        
        jwt.verify(token, process.env.JWT_SECRET)
        res.sendStatus(200)
    } catch (error) {
        res.send(401) //unauthorized         
    }
}) 

app.post("/logout",(req,res)=>{
    res.clearCookie("token")
    res.sendStatus(200)
})




const port = 8000
app.listen(port,()=>console.log("server running on port: ", port)
)
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../../context/Context";
import groupFallbackIcon from "../../Images/group_icon.svg";
import "./chat.css";

const Chat = ({axiosInstance}) => {
	const { user } = useContext(Context);
	const param = useParams();
	const navigate = useNavigate();
	const [group, setGroup] = useState({
		title: "Developers",
		subtitle: "The group of web devs",
		icon: "akshatmittal61-group-developers.jpg",
		admin: "akshatmittal2506@gmail.com",
		description:
			"This is a group of all developers which mainly focuses on Web development but an open source community always welcomes everyone",
		members: [],
	});
	const [groupIcon, setGroupIcon] = useState(
		`https://tegniescorporation.tech/images/${group.icon}`
	);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState("");
	const [chatdata, setchatdata] = useState([]);
	const handleChange = (e) => {
		setMessage(e.target.value);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		await axiosInstance.post("/api/chat/chatpost",{groupid: param.groupName,content: message, userid: user._id});
		setMessages((prev) => {
			return [
				...prev,
				{
					user: user.email,
					name: user.name,
					message: message,
				},
			];
		});
		setMessage("");
		const isread = await axiosInstance.post("/api/group/readmsg",{"groupid":param.groupName,"userid":user._id});
		console.log(isread);
	};

	async function chatGet(){
		const all_group_chat = await axiosInstance.post("/api/chat/chatget",{id:param.groupName});
		console.log(all_group_chat.data?.[0].group_chat?.[0].sender.email);
		console.log(all_group_chat.data);

		setMessages(
				all_group_chat.data?.[0].group_chat.map((el)=>{
					return{
						user: el.sender.email,
						name: el.sender.name,
						message: el.content
					}
				})
		);
		setchatdata(all_group_chat.data[0]);
	}

	async function addRead(){
		const isread = await axiosInstance.post("/api/group/readmsg",{"groupid":param.groupName,"userid":user._id});
		console.log(isread);
	}

	useEffect(()=>{
		if(user.group_joined.includes(param.groupName) === false){
			navigate('/groups');
		}
		chatGet();
		addRead();
	},[])

	return (
		<section className="chat-container">
			<div className="chat-box">
				<div className="chat-head">
					<div className="chat-head-back">
						<button className="icon" onClick={() => navigate(-1)}>
							<span className="material-icons">arrow_back</span>
						</button>
					</div>
					<div className="chat-head-icon">
						<img
							src={groupIcon}
							alt={chatdata.group_name}
							onError={() => {
								setGroupIcon(groupFallbackIcon);
							}}
						/>
					</div>
					<div className="chat-head-name">
						<span>{chatdata.group_name}</span>
					</div>
				</div>
				<div className="chat-body">
					{messages.map((msg, index) => (
						<div className="chat-message" key={msg.index}>
							<a
								href={`mailto:${msg.email}`}
								target="_blank"
								rel="noreferrer"
								className="chat-message-user"
							>
								{msg.name}
							</a>
							<span className="chat-message-msg">
								{msg.message}
							</span>
						</div>
					))}
				</div>
					<div className="chat-foot">
						<form onSubmit={handleSubmit}>
							<input
								type="text"
								name="message"
								value={message}
								onChange={handleChange}
								placeholder="Your Message Here"
							/>
							<button type="submit" className="icon">
								<span className="material-icons">send</span>
							</button>
						</form>
					</div>
					
			</div>
		</section>
	);
};

export default Chat;

/* 
{
    "_id": "61f55f3e21bf1cad717a4b5f",
    "name": "Akshat Mittal",
    "email": "akshatmittal2506@gmail.com",
    "phone": 9456849466,
    "username": "akshatmittal61",
    "verifcation": true,
    "createdAt": "2022-01-29T15:37:34.099Z",
    "updatedAt": "2022-06-11T11:43:36.441Z",
    "__v": 0,
    "batch": "2020",
    "bio": "MERN Stack developer",
    "currentoriginaztion": "MERN",
    "desgination": "Developer",
    "dob": "2002-06-25",
    "fname": "M",
    "gender": "Male",
    "mname": "C",
    "photo": "akshatmittal2506@gmail.com",
    "program": "B.Tech",
    "pyear": "2024",
    "following": [
        "akshatkhosya@itsforyou.live",
        "20106@iiitu.ac.in",
        "akshatdps12@gmail.com",
        "jronak922@gmail.com",
        "ihardikrastogi12@gmail.com",
        "ihardikrastogi@gmail.com",
        "ihardikrastogi1234@gmail.com",
        "mannsinha1902@gmail.com"
    ],
    "verifyStatus": true
} */

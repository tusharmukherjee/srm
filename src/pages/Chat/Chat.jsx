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
	const [file, setFile] = useState(null);

	const handleChange = (e) => {
		setMessage(e.target.value);
	};

	const handleFile = (e) => {
		setFile(e.target.files[0]);
		console.log(file);
	};

	// SUBMIT THE SINGLE cHAT POOOOOOSSssstTTTTTTTTTT
	const handleSubmit = async (e) => {
		e.preventDefault();

		if(file !== null || message.trim() !== ""){

			if(file!==null){
				const image = new FormData();
				const filename = Date.now()+file.name;
				image.append("name", filename);
				image.append("file", file);
				if(file.type.split("/")[1] !== "pdf"){
					let imgPost = await axiosInstance.post("/api/upload", image);
					console.log(imgPost);
				}
				else{
					let pdfPost = await axiosInstance.post("/api/upload/pdf", image);
					console.log(pdfPost);
				}
			}
			
			await axiosInstance.post("/api/chat/chatpost",{groupid: param.groupName,content: message.trim(),"filename":(file !== null)?Date.now()+file?.name:null, userid: user._id});
			setMessages((prev) => {
				return [
					...prev,
					{
						user: user.email,
						name: user.name,
						message: message,
						file: (file !== null)?Date.now()+file?.name:null
					},
				];
			});
			setMessage("");
			setFile(null);
			addRead();
		}
		else{
			console.log("file or message required!");
		}

		
	};

	// GET ALL CHAT GET ALL CHAT GET ALL CHAT GET ALL CHAT GET ALL CHAT
	async function chatGet(){

		const all_group_chat = await axiosInstance.post("/api/chat/chatget",{id:param.groupName});
		console.log(all_group_chat.data?.[0].group_chat?.[0]?.sender?.email);
		console.log(all_group_chat.data);

		setMessages(
				all_group_chat.data?.[0].group_chat.map((el)=>{
					return{
						user: el.sender.email,
						name: el.sender.name,
						message: el.content,
						file:el.file,
						sender:el.sender._id
					}
				})
		);
		setchatdata(all_group_chat.data[0]);
	}

	async function addRead(){
		const isread = await axiosInstance.post("/api/group/readmsg",{"groupid":param.groupName,"userid":user._id});
		console.log(isread);
	}

	function urlify(text) {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		return text.split(urlRegex)
		   .map(part => {
			  if(part.match(urlRegex)) {
				 return <a target="_blank" href={part}>{part}</a>;
			  }
			  return part;
		   });
	  }

	  async function deletechat(sender){	
		const isDelete = await axiosInstance.post("/api/chat/chatdelete",{"groupid":param.groupName,"_id":sender});
		console.log(isDelete);
	  }
	
	//   const headingAvailable = (
	// 	<span className="home_post_text">{urlify(postData.heading)}</span>
	//   );

	useEffect(()=>{
		console.log(file);
		const image = new FormData();
		const filename = group.group_image;
		image.append("name", filename);
		image.append("file", file);

		console.log(image)
	},[file]);

	useEffect(()=>{
		if(chatdata.members?.includes(user._id) === false){
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
							src={(chatdata?.group_image !== "")?`${axiosInstance.defaults.baseURL}images/${chatdata?.group_image}`:groupIcon}
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
						<div className="chat-message" key={index}>
							<a
								href={`mailto:${msg.email}`}
								target="_blank"
								rel="noreferrer"
								className="chat-message-user"
							>
								{msg.name}
							</a>
							<span className="chat-message-msg">
								{urlify(msg.message)}
							</span>
							{
								(msg.file !== null )?
								<>
								{(msg.message !== "")?
								<br/>
								:
								<></>}
								<b>File here:</b>
								{/* .+\.(js|css|etc)[?]? */}
								<a target="_blank" rel="noreferrer" href={`${axiosInstance.defaults.baseURL}pdf/${msg.file}`}>{`${axiosInstance.defaults.baseURL}pdf/${msg.file}`}</a>
								</>
								:
								<></>
							}
						</div>
					))}
				</div>
				<div className="chat-foot">
					<form onSubmit={handleSubmit}>
						<label htmlFor="file">
							<input
								type="file"
								name="file"
								id="file"
								onChange={handleFile}
							/>
							<span className="material-icons icon">
								attach_file
							</span>
						</label>
						<input
							type="text"
							name="message"
							value={message}
							onChange={handleChange}
							placeholder={(file !== null)?`File Attached: ${file.name}`:"Your Message Here"}
							autoFocus
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
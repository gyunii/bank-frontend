import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatBot.module.css';
import chatbotImg from '../../images/Home/chatbot.png';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "banker", text: "안녕하세요! 무엇을 도와드릴까요?" }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const onSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { sender: "customer", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "banker", text: "잠시만 기다려주세요. 담당자가 확인 중입니다." }]);
    }, 1000);
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className={styles.chatbotContainer}>
      {/* 챗봇 창 - 기존 ChatModal 구조 참고 */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <span>💬 은행원 상담 채팅</span>
            <button className={styles.chatCloseBtn} onClick={toggleChat}>✕</button>
          </div>

          <div className={styles.chatBody}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "customer"
                    ? styles.customerMsg
                    : styles.bankerMsg
                }
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <div className={styles.chatInput}>
            <input
              value={input}
              placeholder="메시지를 입력하세요..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <button className={styles.sendBtn} onClick={onSend}>➤</button>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button className={styles.floatingButton} onClick={toggleChat}>
        <img src={chatbotImg} alt="챗봇 버튼" />
      </button>
    </div>
  );
};

export default ChatBot;
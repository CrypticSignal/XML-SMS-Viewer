import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { XMLParser } from "fast-xml-parser";

interface SmsMessage {
  type: string;
  contact_name: string;
  body: string;
  date: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        parseSmsXml(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const parseSmsXml = (xml: string) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const parsed = parser.parse(xml);
    const smsList = parsed.smses?.sms ?? [];
    const smsArray = Array.isArray(smsList) ? smsList : [smsList];

    const parsedMessages: SmsMessage[] = smsArray.map((sms: any) => ({
      type: sms.type,
      contact_name: sms.type === "2" ? "Me" : sms.contact_name || "Unknown",
      body: sms.body || "",
      date: sms.readable_date || "",
    }));

    setMessages(parsedMessages);
  };

  const filteredMessages = messages.filter((msg) =>
    msg.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 20,
      }}
    >
      <input
        type="file"
        accept=".xml"
        onChange={handleFileChange}
        style={{ margin: "20px 0" }}
      />

      <input
        type="text"
        placeholder="Search messages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: 20,
          padding: 8,
          width: "90%",
          maxWidth: 400,
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      />

      <div
        style={{
          width: "90%",
          maxWidth: 800,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {filteredMessages.map((msg, i) => {
          const isSentByMe = msg.type === "2";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isSentByMe ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: isSentByMe ? "#DCF8C6" : "#FFF",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "70%",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                  wordBreak: "break-word",
                }}
              >
                {!isSentByMe && (
                  <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {msg.contact_name}
                  </div>
                )}
                <div>{msg.body}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#888",
                    textAlign: "right",
                    marginTop: 4,
                  }}
                >
                  {msg.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;

import openai_secret_manager
import openai
import facebook
import streamlit as st

# Set up Facebook Graph API client
fb_secret = openai_secret_manager.get_secret("facebook")
fb_access_token = fb_secret["EAAMswYBstxoBAL81w4b0roKZCSCMNFzgYZASgHcklRGlrKAoeekjzBSZBPbtLspNyfYv2CNTvJg9hHVzGcwR2wWpovKZAuKbX1asgZCt7tZA7VzlyRDfR3jHSkO9olqodej3XGHZAIR4Sw2CzfcNDDbnBzt5CJi4lDTxgk9n4oIdNMxfXr0885FwBJDEPUcFf8mUpE3QbIbGy2b9MIhyPfIU1qvG4WySpUQmut4me3fZB9PTAdy6jIi2"]
graph = facebook.GraphAPI(fb_access_token)

# Set up OpenAI API client
openai_secret = openai_secret_manager.get_secret("openai")
openai.api_key = openai_secret["api_key"]

# Set up ChatGPT model
model_engine = "text-davinci-002"
model_prompt = "The following is a conversation with an AI Chatbot. The Chatbot is designed to help you with your questions about our product or service. Please type your question or statement below:"
max_tokens = 50
temperature = 0.7
stop = "\n\n"

def get_chatbot_response(prompt):
    response = openai.Completion.create(
        engine=model_engine,
        prompt=model_prompt + prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=stop
    )
    message = response.choices[0].text.strip()
    return message

# Process incoming Facebook messages and respond with ChatGPT
def process_message(user_message):
    chatbot_message = get_chatbot_response(user_message)
    return chatbot_message

# Set up Streamlit app and UI
st.title("AI Chatbot")

user_message = st.text_input("Enter your message here:")
if user_message:
    chatbot_message = process_message(user_message)
    st.write("Chatbot:", chatbot_message)

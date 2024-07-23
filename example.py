import asyncio
from scrapper import TelegramListener, TelegramScrapper
from config import API_ID, API_HASH, SESSION_NAME, PHONE_NUMBER, SOURCES

async def new_message_handler(sender_name, message):
    print(f"Новое сообщение от {sender_name}: {message}")

async def edited_message_handler(sender_name, message):
    print(f"Изменённое сообщение от {sender_name}: {message}")

async def main():
    scrapper = TelegramScrapper(SESSION_NAME, API_ID, API_HASH, PHONE_NUMBER, '''LINK_FOR_CHAT''')
    await scrapper.start('''LIMIT''')
    for msg in scrapper.messages:
        print(msg)
    
    listener = TelegramListener(SESSION_NAME, API_ID, API_HASH, PHONE_NUMBER, SOURCES)
    await listener.start(new_message_handler, edited_message_handler)

if __name__ == "__main__":
    asyncio.run(main())

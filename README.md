## Table of Contents
* [Getting Started](#getting-started)
  * [Installation](#installation)
* [Usage](#usage)
* [**Config**](#config)
## Getting Started

### Installation
* Clone the GitHub repository:
	```bash
	git clone https://github.com/your/link.git	
	```
* Navigate to directory:
	```bash
	cd TelegramParser	
	```
* (Recommended) Create a virtual environment to manage Python packages for your project:
	```bash
	python3 -m venv venv
	```
* Activate the virtual enviropment
	* On windows:
		```bash
		.\venv\Scripts\activate
		```  
	* On linux or macOs:
		```
		source venv/bin/activate
		```
* Install the required Python packages from  `requirements.txt`:
	```bash
	pip install -r requirments.txt
	```
## Usage

```python
import asyncio
from scrapper import TelegramListener, TelegramScrapper
from config import API_ID, API_HASH, SESSION_NAME, PHONE_NUMBER, SOURCES

async def new_message_handler(sender_name, message):
    print(f"New message from {sender_name}: {message}")

async def edited_message_handler(sender_name, message):
    print(f"Edited message from {sender_name}: {message}")

async def main():
    scrapper = TelegramScrapper(SESSION_NAME, API_ID, API_HASH, PHONE_NUMBER, '''LINK_FOR_CHAT''')
    await scrapper.start('''LIMIT''')
    for msg in scrapper.messages:
        print(msg)
    
    listener = TelegramListener(SESSION_NAME, API_ID, API_HASH, PHONE_NUMBER, SOURCES)
    await listener.start(new_message_handler, edited_message_handler)

if __name__ == "__main__":
    asyncio.run(main())
```

## Config

| Config Name    | Description                                                           | Conditions                                                 | Example                                     |
|------------------|-----------------------------------------------------------------------|------------------------------------------------------------|---------------------------------------------|
| `session_name`   | Имя сессии Telegram.                                                  | Строка, уникальная для каждой сессии.                      | `session_name='my_session'`                 |
| `api_id`         | API ID, полученный от Telegram.                                       | Целое число.                                               | `api_id=123456`                             |
| `api_hash`       | API Hash, полученный от Telegram.                                     | Строка.                                                    | `api_hash='your_api_hash'`                  |
| `phone_number`   | Телефонный номер, используемый для авторизации.                       | Строка, содержащая телефонный номер в международном формате. | `phone_number='+1234567890'`                |
| `sources`        | Список имен пользователей или идентификаторов, от которых будут приниматься сообщения. | Список строк, содержащих имена пользователей или идентификаторы. | `sources=['username1', 'username2']`        |
| `message_callback` | Функция-обработчик, которая вызывается при получении нового сообщения. | Callable, принимающая два аргумента: `sender_name` и `message`. | `async def message_handler(sender_name, message): print(sender_name, message)` |
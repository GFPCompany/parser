from telethon import TelegramClient, events
import asyncio

class TelegramListener:
    """
    Класс для прослушивания сообщений в Telegram.

    Аргументы:
    session_name (str): Имя сессии Telegram.
    api_id (int): ID API, полученный от Telegram.
    api_hash (str): Hash API, полученный от Telegram.
    phone_number (str): Телефонный номер, используемый для авторизации.
    sources (list): Список имен пользователей или идентификаторов, от которых будут приниматься сообщения.
    """
    def __init__(self, session_name, api_id, api_hash, phone_number, sources):
        self.client = TelegramClient(session_name, api_id, api_hash)
        self.phone_number = phone_number
        self.sources = sources
        self.new_message_callback = None
        self.edited_message_callback = None

    async def authorize_client(self):
        """
        Асинхронная функция для авторизации клиента. 
        Отправляет запрос кода на указанный телефонный номер и запрашивает ввод кода для завершения авторизации.
        """
        if not await self.client.is_user_authorized():
            print("Авторизация...")
            await self.client.send_code_request(self.phone_number)
            await self.client.sign_in(self.phone_number, input('Введите код: '))

    async def handle_message(self, event):
        """
        Обрабатывает полученное сообщение и вызывает callback-функцию, если отправитель находится в списке источников.

        Аргументы:
        event (Event): Событие, содержащее информацию о новом сообщении.
        """
        sender = await event.get_sender()
        if sender.username in self.sources:
            sender_name = sender.username if sender.username else sender.id
            message = event.message.message
            if self.new_message_callback:
                await self.new_message_callback(sender_name, message)

    async def handle_edited_message(self, event):
        """
        Обрабатывает отредактированное сообщение и вызывает callback-функцию, если отправитель находится в списке источников.

        Аргументы:
        event (Event): Событие, содержащее информацию об отредактированном сообщении.
        """
        sender = await event.get_sender()
        if sender.username in self.sources:
            sender_name = sender.username if sender.username else sender.id
            message = event.message.message
            if self.edited_message_callback:
                await self.edited_message_callback(sender_name, message)

    async def start(self, new_message_callback, edited_message_callback):
        """
        Запускает прослушивание новых и отредактированных сообщений и авторизует клиента.

        Аргументы:
        new_message_callback (callable): Функция-обработчик, которая вызывается при получении нового сообщения.
        edited_message_callback (callable): Функция-обработчик, которая вызывается при редактировании сообщения.
        """
        self.new_message_callback = new_message_callback
        self.edited_message_callback = edited_message_callback

        @self.client.on(events.NewMessage(chats=self.sources))
        async def new_message_handler(event):
            await self.handle_message(event)

        @self.client.on(events.MessageEdited(chats=self.sources))
        async def edited_message_handler(event):
            await self.handle_edited_message(event)

        await self.client.start()
        await self.authorize_client()
        await self.client.run_until_disconnected()
        
class TelegramScrapper:
    """
    Класс для сбора сообщений из Telegram чата/канала/группы.

    Аргументы:
    session_name (str): Имя сессии Telegram.
    api_id (int): ID API, полученный от Telegram.
    api_hash (str): Hash API, полученный от Telegram.
    phone_number (str): Телефонный номер, используемый для авторизации.
    chat (str or int): Имя пользователя или ID чата/канала/группы для сбора сообщений.
    """
    def __init__(self, session_name, api_id, api_hash, phone_number, chat):
        self.client = TelegramClient(session_name, api_id, api_hash)
        self.phone_number = phone_number
        self.chat = chat
        self.messages = []

    async def authorize_client(self):
        """
        Асинхронная функция для авторизации клиента.
        Отправляет запрос кода на указанный телефонный номер и запрашивает ввод кода для завершения авторизации.
        """
        if not await self.client.is_user_authorized():
            await self.client.send_code_request(self.phone_number)
            await self.client.sign_in(self.phone_number, input('Введите код: '))

    async def scrape_messages(self, limit):
        """
        Асинхронная функция для сбора сообщений из чата/канала/группы.

        Аргументы:
        limit (int): Количество сообщений для сбора.
        """
        count = 0
        async for message in self.client.iter_messages(self.chat):
            if not message.out:
                self.messages.append(message.text)
                count += 1
                if count > limit:
                    break

    async def start(self, limit):
        """
        Запускает сбор сообщений и авторизует клиента.

        Аргументы:
        limit (int): Количество сообщений для сбора.
        """
        await self.client.start()
        await self.authorize_client()
        await self.scrape_messages(limit)
        await self.client.disconnect()
from telethon import TelegramClient, events, Button
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import asyncio
import requests
import config

app = FastAPI()

API_ID = config.API_ID
API_HASH = config.API_HASH
SESSION_NAME = config.SESSION_NAME
PHONE_NUMBER = config.PHONE_NUMBER

client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

class Order(BaseModel):
    date: str
    time: str
    start_location: str = "Точка А"
    end_location: str = "Точка Б"
    vehicle_type: str = "Неизвестно"
    price: int = 0
    passengers: int = 0
    order_number: int = 0

async def new_message_handler(event):
    sender_name = event.sender_id
    message = event.raw_text
    order_details = process_message(message)
    if order_details:
        await send_order_to_api(order_details, event.message)

def process_message(message: str):
    try:
        lines = message.split('\n')
        date_time = lines[0].split()
        locations = lines[1].split(' - ') if len(lines) > 1 else [lines, "..."]
        vehicle_info = lines[2].split() if len(lines) > 2 else ["Неизвестно", "0₽", "", "0", "", "№: 0"]
        
        order = Order(
            date=date_time[0],
            time=date_time[1],
            start_location=locations[0],
            end_location=locations[1],
            vehicle_type=vehicle_info[0],
            price=int(vehicle_info[1].replace('₽', '')),
            passengers=int(vehicle_info[3]),
            order_number=int(vehicle_info[5].replace('№: ', ''))
        )
        return order
    except Exception as e:
        print(f"Error processing message: {e}")
        return None

async def send_order_to_api(order: Order, message):
    url = "https://ibronevik.ru/taxi/c/gruzvill/api/v1/drive"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    data = {
        "token": "7f74f5196377f2687cb12b42ff71aadb",
        "u_hash": "NLIG3kLA2eKVdmCarjk2sija7TWtDAn/FVxczTPkhPt51+maemjafZYggqCkHNifCnG64pwjvh3cy4EwD0erfZIyweWRNxGR/qsqe26Si66jarVQtgVrokibsxTndIuK",
        "data": {
            "b_start_address": order.start_location,
            "b_start_latitude": "",
            "b_start_longitude": "",
            "b_destination_address": order.end_location,
            "b_destination_latitude": "",
            "b_destination_longitude": "",
            "b_comments": [],
            "b_contact": "",
            "b_start_datetime": f"{order.date} {order.time}",
            "b_passengers_count": str(order.passengers),
            "b_car_class": order.vehicle_type,
            "b_payment_way": 1,
            "b_max_waiting": 7200,
            "b_services": [],
        }
    }
    
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        order_id = response.json().get("order_id")
        await check_order_status(order_id, message)
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

async def check_order_status(order_id, message):
    url = f"https://ibronevik.ru/taxi/c/gruzvill/api/v1/status/{order_id}"
    headers = {'Content-Type': 'application/json'}
    max_wait_time = 7200  # 2 hours
    check_interval = 15  # 15 seconds

    for _ in range(max_wait_time // check_interval):
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            status = response.json().get("status")
            if status == "accepted":
                await press_buttons(message)
                return
        await asyncio.sleep(check_interval)
    await cancel_order(order_id)

async def press_buttons(message):
    buttons = message.buttons
    for row in buttons:
        for button in row:
            if isinstance(button, Button) and button.text == 'Взять заказ':
                await message.click(button)
                await asyncio.sleep(1)
                buttons = message.buttons
                for row in buttons:
                    for button in row:
                        if isinstance(button, Button) and button.text == '✅ Да, взять заказ':
                            await message.click(button)
                            return

async def cancel_order(order_id):
    url = f"https://ibronevik.ru/taxi/c/gruzvill/api/v1/cancel/{order_id}"
    headers = {'Content-Type': 'application/json'}
    requests.post(url, headers=headers)

@app.on_event("startup")
async def startup_event():
    await client.start(phone=PHONE_NUMBER)
    client.add_event_handler(new_message_handler, events.NewMessage)

    async with client:
        await client.run_until_disconnected()

@app.post("/order/")
async def create_order(order: Order, background_tasks: BackgroundTasks):
    response = await send_order_to_api(order, None)
    return {"message": "Order received", "response": response}

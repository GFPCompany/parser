function startReplyTimer(order_id, timeout) {
    setTimeout(() => {
        cancelOrder(order_id);
    }, timeout);
}

function cancelOrder(order_id) {
    var url = url_prefix + "cancel";
    var post_obj = {
        "token": client_token,
        "u_hash": client_u_hash,
        "order_id": order_id
    };
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(encode_data(post_obj));
}

function handleDriverReply(order_id, driver_reply) {
    if (driver_reply.accepted) {
        confirmOrder(order_id);
    } else {
        cancelOrder(order_id);
    }
}

function confirmOrder(order_id) {
    var url = url_prefix + "confirm";
    var post_obj = {
        "token": client_token,
        "u_hash": client_u_hash,
        "order_id": order_id
    };
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(encode_data(post_obj));
}
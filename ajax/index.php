<?php
if (!$_POST['data']) return;

$postData = json_decode($_POST['data'], true);

if (!isset($postData['action'])) return; // Если не указано действие
$actionFilePath = __DIR__ . '/' . $postData['action'] . '.php'; // Путь к файлу действия

/**
 * Отправка ответа от сервера
 * 
 * @param bool $status - статус ответа
 * @param array $data - дополнительные данные ответа
 * 
 * Завершает выполнение скрипта, выводя ответ в формате json
 */
function sendResponse($status, $data) {
    print_r(json_encode([
        'status' => $status,
        'data' => $data
    ]));

    die;
}

// --------------

if (file_exists($actionFilePath)) {
    include($actionFilePath); // Подключение файла действий
} else {
    sendResponse(false, 'Action is not available.');
}
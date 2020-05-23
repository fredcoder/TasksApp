// Initial functions
$(document).ready(function () {

    var addTaskTextbox = $("#addTask");
    var addTask;

    addTaskTextbox.keydown(function (e) {
        if (e.keyCode === 13) {
            console.log('keydown');
            addTask = $.trim(addTaskTextbox.val());
            if (addTask != "")
                addItem(addTask);
        }
    });

    addTaskTextbox.blur(function () {
        console.log('blur');
        addTask = $.trim(addTaskTextbox.val());
        if (addTask != "")
            addItem(addTask);
    });
});

//Get items from API
const uri = 'http://192.168.20.42/api/TaskItems';
function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

//AddItem function
function addItem(addTask) {

    const item = {
        complete: false,
        description: addTask
    };

    //AddItem to API
    fetch(uri, {
        method: 'POST',
        headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
        body: JSON.stringify(item)
        })
        .then(response => response.json())
        .then(() => {
            getItems();
            document.getElementById('addTask').value = '';
        })
        .catch(error => console.error('Unable to add item.', error));
}

//DeleteItem function to API
function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
        })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

//UpdateItem function to API
function updateItem(itemId) {
    const item = {
                id: parseInt(itemId, 10),
                complete: document.getElementById('checkbox' + itemId).checked,
                description: document.getElementById(itemId).value.trim()
                };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
        body: JSON.stringify(item)
        })
        .then(() => getItems())
        .catch(error => console.error('Unable to update item.', error));

    return false;
}

//Display tasks counter
function _displayCount (itemCount, done) {
    const name = (itemCount === 1) ? 'task' : 'tasks';
    document.getElementById('counter').innerText = `${done} of ${itemCount} ${name} done`;
}

//Display tasks list
function _displayItems(data) {

    const tasksList = document.getElementById('tasksList');
    if (tasksList.hasChildNodes()) {
        var nodos = tasksList.childNodes.length;
        for (var n = 0; n < nodos; n++)
        {
            tasksList.removeChild(tasksList.childNodes[0]);
        }
    }

    var done = 0;

    data.forEach(item => {
        //ListItem
        let listItem = document.createElement('li');

        //isCompleteCheckbox
        let isCompleteCheckbox = document.createElement('input');
        isCompleteCheckbox.type = 'checkbox';
        isCompleteCheckbox.checked = item.complete;
        isCompleteCheckbox.setAttribute('id', 'checkbox' + item.id)
        isCompleteCheckbox.addEventListener('change', function () {
            if (this.checked) {
                $('#' + item.id).css('text-decoration', 'line-through');
                updateItem(item.id)
            }
            else {
                $('#' + item.id).css('text-decoration', 'none');
                updateItem(item.id)
            }
        });
        //checkLabel
        let checkLabel = document.createElement('label');
        checkLabel.setAttribute('for', 'checkbox'+item.id);

        //deleteButton
        let deleteButton = document.createElement('a');
        deleteButton.setAttribute('class', 'delete');
        deleteButton.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
        deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);
        
        //textNode
        let textNode = document.createElement('input');
        textNode.setAttribute('id', item.id);
        textNode.setAttribute('type', 'text');
        textNode.setAttribute('value', item.description);
        textNode.setAttribute('maxlength', 32);
        if (isCompleteCheckbox.checked === true)
            textNode.setAttribute('class', 'decored_input');
        textNode.addEventListener('blur', (event) => {
            updateItem(item.id)
        });
        textNode.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                document.getElementById(item.id).blur();
            }
        });

        //listItem.appendChild
        listItem.appendChild(isCompleteCheckbox);
        listItem.appendChild(checkLabel);
        listItem.appendChild(textNode);
        listItem.appendChild(deleteButton);

        //tasksList.appendChild
        tasksList.appendChild(listItem);

        //increment counter
        if (item.complete)
            done++;
    });
    
    _displayCount(data.length,done);
}
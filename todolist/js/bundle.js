/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoListItem_js__ = __webpack_require__(2);
/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/
/*jslint esversion: 6 */



const TodoListDefaults = {
	// adding
	enableAdding: true,
	customAdding: null, // DOM Element form
	iconText: '<span class="fa fa-plus-circle"></span>',
	placeholder: 'New todo:',
	// title
	titleText: null,
	titleElement: 'h5',
	titleEditable: true,
	// tools
	tools: true,
	moving: false,
	moveLeftToolText: '<span class="fa fa-chevron-circle-left"></span>',
	moveRightToolText: '<span class="fa fa-chevron-circle-right"></span>',
	removeToolText: '<span class="fa fa-trash"></span>',
	clearToolText: '<span class="fa fa-times-circle"></span>',
	// other
	readonly: false,
	listItem: {} // extends todoListItem default options
};
/* unused harmony export TodoListDefaults */


const TEMPLATE = `
<div class="todolist">
	<div class="todolist--list"></div>
</div>
`;

class TodoList {

	constructor(listParentElement, data, options) {
		this.options = Object.assign({}, TodoListDefaults, options);
		this.options.listItem = Object.assign({}, options.listItem);

		if (this.options.readonly) {
			this.options.enableAdding = false;
			this.options.tools = false;
			this.options.listItem.editable = false;
			this.options.listItem.removable = false;
		}

		this.data = data || [];
		this.itemsArray = []; // contains objects of TodoListItem

		this.loadTemplate(listParentElement);
		this.setList(this.data);
		this.initHandlers();
	}

	get title() {
		return this._title;
	}

	set title(value) {
		this._title = value;
		this.titleElement.innerHTML = value;

		let setTitle = new CustomEvent("todoList.setTitle", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(setTitle);
	}

	loadTemplate(listParentElement) {
		listParentElement.innerHTML = TEMPLATE;
		this.listElement = listParentElement.querySelector('.todolist--list');

		this.options.titleText && this.createTitle();
		this.options.tools && this.createTools();
		this.options.enableAdding && this.setAddingForm();
	}

	createTitle() {
		this.titleElement = document.createElement(this.options.titleElement);
		this.titleElement.classList.add('todolist--title');
		this.titleElement.setAttribute('contenteditable', this.options.titleEditable);
		this.listElement.parentElement.insertBefore(this.titleElement, this.listElement);
		this.title = this.options.titleText;
	}

	createTools() {
		this.tools = document.createElement('div');
		this.tools.classList.add('todolist--tools');

		let inner = `
			<div class="tool clear">${this.options.clearToolText}</div>
			<div class="tool remove">${this.options.removeToolText}</div>
		`;
		this.tools.innerHTML = inner;
		this.listElement.parentElement.insertBefore(this.tools, this.listElement);

		this.clearTool = this.tools.querySelector('.tool.clear');
		this.removeTool = this.tools.querySelector('.tool.remove');

		this.clearTool.addEventListener('click', this.clearList.bind(this));
		this.removeTool.addEventListener('click', this.removeList.bind(this));

		this.options.moving && this.createMoving();
	}

	createMoving() {
		this.moveTool = {};

		this.mover = document.createElement('div');
		this.mover.classList.add('tool', 'mover');

		let inner = `
			<div class="tool move left">${this.options.moveLeftToolText}</div>
			<div class="tool move right">${this.options.moveRightToolText}</div>
		`;
		this.mover.innerHTML = inner;
		this.tools.insertBefore(this.mover, this.tools.querySelector('.tool.clear'));

		this.moveTool.left = this.mover.querySelector('.tool.left');
		this.moveTool.right = this.mover.querySelector('.tool.right');

		this.moveTool.left.addEventListener('click', this.onMoveList.bind(this, 'left'));
		this.moveTool.right.addEventListener('click', this.onMoveList.bind(this, 'right'));
	};

	setAddingForm() {
		if (this.options.customAdding) {
			// set from options if is set
			this.addForm = this.options.customAdding;
			this.addInput = this.addForm.querySelector('input');
			this.addForm.addEventListener('submit', this.onAddTodo.bind(this));
		} else {
			this.createAddingItem();
			this.addBox.addEventListener('focus', this.onAddBoxFocus.bind(this));
			this.addBox.addEventListener('input', this.onAddTodo.bind(this));
		}
	}

	createAddingItem() {
		let inner = `
		<div class="todolist-item--add-icon">${this.options.iconText}</div>
		<div class="todolist-item--text single-line">
            <div class="placeholder">${this.options.placeholder}</div>
            <div class="adding-box" contenteditable="true"></div>
        </div>`;

		this.addElem = document.createElement('li');
		this.addElem.classList.add('todolist-item', 'add-item', 'editable');
		this.listElement.appendChild(this.addElem);

		this.addElem.innerHTML = inner;
		this.addBox = this.addElem.querySelector('.adding-box');
	}

	setList(data) {
		data = data || [];
		this.itemsArray = [];
		this.listElement.innerHTML = '';
		this.addElem && this.listElement.appendChild(this.addElem);
		data.forEach((todo) => {
			let item = new __WEBPACK_IMPORTED_MODULE_0__todoListItem_js__["a" /* TodoListItem */](todo.text, todo.complete, this.options.listItem);
			this.add(item);
		});
	}

	add(item) {
		if (this.addElem) {
			this.listElement.insertBefore(item.elem, this.addElem);
		} else {
			this.listElement.appendChild(item.elem);
		}

		this.itemsArray.push(item);

		let addItem = new CustomEvent("todoList.addItem", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(addItem);
	}

	initHandlers() {
		this.listElement.addEventListener('todoListItem.remove', this.onRemoveTodo.bind(this));
		document.addEventListener('click', this.onBlur.bind(this));
	}

	onRemoveTodo(event) {
		let item = event.detail.item;
		let index = this.itemsArray.indexOf(item);
		this.itemsArray.splice(index, 1);
	}

	onAddBoxFocus(event) {
		this.addElem.classList.add('active');
	}

	onBlur(event) {
		if (this.addElem) {
			if (event.target == this.addBox || event.target.closest('.add-item') == this.addElem) {
				this.addBox.focus();
			} else {
				this.addElem.classList.remove('active');
			}
		}
		if (this.title && this.options.titleEditable && event.target != this.titleElement && this.title != this.titleElement.innerHTML) {
			this.title = this.titleElement.innerHTML;
		}
	}

	onAddTodo(event) {
		event.preventDefault();

		let value = this.getInputValue(),
			item = null;

		if (value) {
			item = new __WEBPACK_IMPORTED_MODULE_0__todoListItem_js__["a" /* TodoListItem */](value, false, this.options.listItem, this.listElement);
			this.add(item);
			this.clearInput();
			this.addElem && this.addElem.classList.remove('active');
			item.textBox.focus();
		}

		this.options.onAddTodo && this.options.onAddTodo.call(this, item);
	}

	clearList() {
		this.setList();

		let clear = new CustomEvent("todoList.clear", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(clear);
	}

	removeList() {
		let todoListRemove = new CustomEvent("todoList.remove", {
			bubbles: true,
			detail: { todoList: this }
		});
		this.listElement.dispatchEvent(todoListRemove);

		this.listElement.remove();
		this.titleElement.remove();
		this.tools.remove();
	}

	onMoveList(direction) {
		let moveTodoList = new CustomEvent("todoList.move", {
			bubbles: true,
			detail: {
				direction: direction,
				todoList: this
			}
		});
		this.listElement.dispatchEvent(moveTodoList);
	}

	getInputValue() {
		if (this.options.customAdding) {
			return this.addInput.value;
		} else {
			return this.addBox.innerHTML;
		}
	}

	clearInput() {
		if (this.options.customAdding) {
			this.addInput.value = '';
		} else {
			this.addBox.innerHTML = '';
		}
	}

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoList;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoList_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__todoListBuilder_js__ = __webpack_require__(3);
/*jslint esversion: 6 */
/*jslint node: true */
/*global document, alert, fetch, Autocomplete, Chips, TodoList, countriesData, todoData*/





// TODO: add JS Doc

/* TODOLIST */

var todos = document.querySelector('.presentation#todolist');

getToDoData('todo').then((data) => {
    let defaultList = new __WEBPACK_IMPORTED_MODULE_0__todoList_js__["a" /* TodoList */](todos.querySelector('#todolist-default'), data, {
        customAdding: document.querySelector('.custom-form'),
        onAddTodo: onAddTodo,
        tools: false
    });
    let customList = new __WEBPACK_IMPORTED_MODULE_0__todoList_js__["a" /* TodoList */](todos.querySelector('#todolist-custom'), data, {
        titleText: 'Summer education'
    });
    let disabledList = new __WEBPACK_IMPORTED_MODULE_0__todoList_js__["a" /* TodoList */](todos.querySelector('#todolist-disabled'), data, {
        readonly: true
    });
});

/* TODOLIST BUILDER */

let boardElement = document.querySelector('#todo-board');
let desk = new __WEBPACK_IMPORTED_MODULE_1__todoListBuilder_js__["a" /* TodoListBuilder */](boardElement, {
    boardClasses: 'row-24',
    builderFormOuterClasses: 'row-24>.col.xxs-24.md-12.lg-8.offset-md-6.offset-lg-8',
    builderFormClasses: 'custom-form',
    builderInputOuterClasses: 'form-control',
    builderButtonClasses: 'btn btn-add btn-icon blue',
    todoListOuterClasses: '.col.xxs-24.md-12.lg-8',
    builderButtonText: '<span class="text">Add</span><span class="icon"><span class="fa fa-plus"></span></span>',
    todoList: {
        titleText: 'New List'
    },
    // sources: ['/data/todos.json']
});

/* FUNCTIONS */

function onAddTodo(item) {
    let btn = document.querySelector('.custom-form .btn-icon');
    btn.classList.remove('success', 'error');
    if (item) {
        btn.classList.add('success');
        console.log('Item with text \'' + item.text + '\' created successfully! Default complete status is: ' + item.complete + '\'.');
    } else {
        btn.classList.add('error');
        console.log('Cannot create item with text \'' + document.querySelector('.custom-form input').value + '\'.');
    }
    setTimeout(function () {
        btn.classList.remove('success', 'error');
    }, 2000);
}

function getToDoData(dataString, todolist) {
    return new Promise((resolve, reject) => {
        resolve(todoData);
    });
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/
/*jslint esversion: 6 */

const TodoListItemDefaults = {
	editable: true,
	removable: true,
	singleLine: true,
	removeBtnText: '<span class="fa fa-times-circle"></span>'
};
/* unused harmony export TodoListItemDefaults */


class TodoListItem {

	constructor(text, complete, options) {

		this.parentList = options.parentList;
		this.options = Object.assign({}, TodoListItemDefaults, options);

		this.createElem();
		this.initHandlers();

		this.text = text;
		this.complete = complete;
	}

	get text() {
		return this._text;
	}

	set text(value) {
		this._text = value;
		this.textBox.innerHTML = value;

		var itemEdit = new CustomEvent("todoListItem.edit", {
			bubbles: true,
			detail: { item: this }
		});
		this.elem.dispatchEvent(itemEdit);
	}

	get complete() {
		return this._complete;
	}

	set complete(value) {
		this._complete = value;

		if (value) {
			this.elem.classList.add('complete');
			this.checkbox.checked = true;
		} else {
			this.elem.classList.remove('complete');
			this.checkbox.checked = false;
		}

		var itemSetStatus = new CustomEvent("todoListItem.setStatus", {
			bubbles: true,
			detail: { item: this }
		});
		this.elem.dispatchEvent(itemSetStatus);
	}

	createElem() {
		this.elem = document.createElement('li');
		this.elem.classList.add('todolist-item');

		this.createCheckBox();
		this.createTextBox();

		this.options.editable && this.elem.classList.add('editable');
		this.textBox.setAttribute('contenteditable', this.options.editable);

		this.options.removable && this.createRemoveBtn();
	}

	createCheckBox() {
		this.checkbox = document.createElement('input');
		this.checkbox.type = 'checkbox';
		this.checkbox.setAttribute('tabindex', '-1');
		this.checkboxLabel = document.createElement('label')
		this.checkboxLabel.classList.add('todolist-item--complete');
		this.checkboxLabel.appendChild(this.checkbox);
		this.elem.appendChild(this.checkboxLabel);
	}

	createRemoveBtn() {
		this.removeBtn = document.createElement('div');
		this.removeBtn.classList.add('todolist-item--remove');
		this.removeBtn.innerHTML = this.options.removeBtnText;
		this.elem.appendChild(this.removeBtn);
	}

	createTextBox() {
		this.textBox = document.createElement('div');
		this.textBox.classList.add('todolist-item--text');
		this.options.singleLine && this.elem.classList.add('single-line');
		this.elem.appendChild(this.textBox);
	}

	initHandlers() {
		this.checkbox.addEventListener('click', this.toggleComplete.bind(this));
		// document.addEventListener('click', this.onBlur.bind(this));

		if (this.options.editable) {
			this.textBox.addEventListener('focus', this.onEdit.bind(this));
			this.textBox.addEventListener('blur', this.onBlur.bind(this));
			// this.textBox.querySelector('span').addEventListener('focus', this.onEdit.bind(this));
		}
		if (this.options.removable) {
			this.removeBtn.addEventListener('click', this.onRemove.bind(this));
		}
	}

	toggleComplete() {
		this.complete = !this.complete;
	}

	onRemove() {
		var itemRemove = new CustomEvent("todoListItem.remove", {
			bubbles: true,
			detail: { item: this }
		});
		this.elem.dispatchEvent(itemRemove);

		this.elem.remove();
	}

	onEdit() {
		this.placeCaretAtEnd();
		this.elem.classList.add('active');
	}

	onBlur() {
		if (document.activeElement != this.textBox) {
			this.elem.classList.remove('active');
			this.updateTextValue();
		}
	}

	updateTextValue() {
		if (this.textBox.innerHTML && !this.isActualText()) {
			this.text = this.textBox.innerHTML;
		} else {
			this.textBox.innerHTML = this.text;
		}
	}

	isActualText() {
		return this.text == this.textBox.innerHTML ? true : false;
	}

	placeCaretAtEnd() {
		var range,selection;
		range = document.createRange();//Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(this.textBox);//Select the entire contents of the element with the range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		selection = window.getSelection();//get the selection object (allows you to change selection)
		selection.removeAllRanges();//remove any selections already made
		selection.addRange(range);//make the range you have just created the visible selection
	}

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoListItem;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoList_js__ = __webpack_require__(0);
/*
*    JavaScript TodoListBuilder
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/
/*jslint esversion: 6 */



const TodoListBuilderDefaults = {
	enableAdding: true,
	boardClasses: '',
	todoListOuterClasses: 'todolist-outer',
	builderFormOuterClasses: 'builder-form-outer',
	builderFormClasses: 'builder-form',
	builderInputOuterClasses: 'form-control',
	builderButtonText: 'Add TodoList',
	builderPlaceholder: 'New TodoList',
	builderButtonClasses: 'btn btn-builder', // string of classes, e.g. '.my.outer>.nested'
	moveAnimation: true,
	sources: [], // array of URL strings
	todoList: { // extends todoList default options
		tools: true,
		moving: true
	}
};
/* unused harmony export TodoListBuilderDefaults */


class TodoListBuilder {

	constructor(builderParentElement, options) {

		this.options = Object.assign({}, TodoListBuilderDefaults, options);
		this.options.todoList = Object.assign(
			{},
			TodoListBuilderDefaults.todoList,
			options.todoList);

		this.lists = [];
		this.data = [];

		this.loadTemplate(builderParentElement);
		this.init();
		this.initEvents();

	}

	loadTemplate(builderParentElement) {
		let template = `
		<div class="todolist-builder">
			<div class="todolist-board ${this.options.boardClasses}"></div>
		</div>
		`;
		builderParentElement.innerHTML = template;
		this.board = builderParentElement.querySelector('.todolist-board');

		this.todoListOuterTemplate = this.createOuter(this.options.todoListOuterClasses);

		this.options.enableAdding && this.createBuilderForm();
	}

	createBuilderForm() {
		this.builder = {};

		this.builder.form = document.createElement('form');
		this.builder.form.className = this.options.builderFormClasses;

		this.builder.input = document.createElement('input');
		this.builder.input.type = 'text';
		this.builder.input.placeholder = this.options.builderPlaceholder;

		this.builder.button = document.createElement('button');
		this.builder.button.type = 'submit';
		this.builder.button.className = this.options.builderButtonClasses;
		this.builder.button.innerHTML = this.options.builderButtonText;

		let builderOuter = this.createOuter(this.options.builderFormOuterClasses) || this.builder.form;
		let builderOuterDeepest = builderOuter.querySelector('.outer-deepest') || builderOuter;

		let inputOuter = this.createOuter(this.options.builderInputOuterClasses) || this.builder.input;
		let inputOuterDeepest = inputOuter.querySelector('.outer-deepest') || inputOuter;

		if (builderOuter != this.builder.form) {
			builderOuterDeepest.appendChild(this.builder.form);
		}
		if (builderOuter != this.builder.form) {
			inputOuterDeepest.appendChild(this.builder.input);
		}

		builderOuterDeepest.classList.remove('outer-deepest');
		inputOuterDeepest.classList.remove('outer-deepest');

		this.builder.form.appendChild(inputOuter);
		this.builder.form.appendChild(this.builder.button);
		this.board.parentElement.insertBefore(builderOuter, this.board);
	}

	createOuter(outerClassesString) {
		if (!outerClassesString) return;

		let outerElementsArray = outerClassesString.split('>'),
			last = outerElementsArray.length - 1,
			i = 0,
			str = '';

		outerElementsArray.forEach(outerElementsClasses => {
			if (i == last) {
				outerElementsClasses += '.outer-deepest';
			}

			str += '<div class="';
			let elementClassArray = outerElementsClasses.split('.');

			elementClassArray.forEach(className => {
				str += className + ' ';
			});

			str += '">';
			i++;
		});
		outerElementsArray.forEach(() => {
			str += '</div>';
		});

		let temp = document.createElement('div');
		temp.innerHTML = str;
		let outer = temp.childNodes[0];

		return outer;
	}

	init() {
		let data = localStorage.todolist;
		data && this.parseLocal(data);

		// build from local if exists
		if (this.data.length > 0) {
			this.data.forEach(todoList => {
				this.buildList(todoList);
			});
		}

		// build from sources if set
		if (this.options.sources.length > 0) {
			this.options.sources.forEach(source => {
				this.getSourceData(source).then((sourceData) => {
					this.data = this.data.concat(sourceData);
					// add todolists from source when response come
					sourceData.forEach(todoList => {
						this.buildList(todoList);
					});
					this.updateStorage();
				});
			});
		}

		// build empty list if no data set
		if (this.data.length === 0 && this.options.sources.length === 0) {
			this.buildList();
		}

		this.updateStorage();
	}

	parseLocal(data) {
		let parsedLists = JSON.parse(data);

		parsedLists.forEach(list => {
			let listData = {
				order: list[0],
				title: list[1],
				data: []
			};
			list[2].forEach(item => {
				let itemData = {
					order: item[0],
					text: item[1],
					complete: item[2]
				};
				listData.data.push(itemData);
			});
			this.data.push(listData);
		});
	}

	getSourceData(url) {
		return fetch(url).then(function(result){
			return result.json();
		});
	}

	buildList(todoList) {
		todoList = todoList || {};
		let newList = {};

		let outer, outerDeepest = null;

		if (this.todoListOuterTemplate) {
			outer = this.todoListOuterTemplate.cloneNode(true);
			outerDeepest = outer.querySelector('.outer-deepest') || outer;
			outerDeepest.classList.remove('outer-deepest');
			this.board.appendChild(outer);
		}

		let newListOptions = {
			titleText: todoList.title || this.options.todoList.titleText
		};
		newListOptions = Object.assign({}, this.options.todoList, newListOptions);

		newList.item = new __WEBPACK_IMPORTED_MODULE_0__todoList_js__["a" /* TodoList */](outerDeepest || this.board, todoList.data, newListOptions);
		newList.outer = outer || newList.item.listElement;
		// newList.order = this.lists.length; // starts from 0
		this.lists.push(newList);
	}

	isEdge(i, direction) {
		if ((i == 0 && direction == 'left') ||
			(i == this.lists.length - 1 && direction == 'right')) {
			return true;
		}
	}

	moveList(i, step, direction) {
		let list = this.lists[i];
		let j = 0;

		switch(direction) {
			case 'left':
				j = i - step;
				break;
			case 'right':
				j = i + step;
				break;
			default: return;
		}

		let slist = this.lists[j];

		if (j > i) {
			this.board.insertBefore(slist.outer, list.outer);
		} else {
			this.board.insertBefore(list.outer, slist.outer);
		}

		this.lists.splice(i, 1);
		this.lists.splice(j, 0, list);
	}

	swap(mainIndex, secondaryIndex) {
		if (mainIndex == secondaryIndex) return;

		if (secondaryIndex > this.lists.length - 1) secondaryIndex = 0;
		if (secondaryIndex < 0) secondaryIndex = this.lists.length - 1;

		let over = this.lists[mainIndex].outer;
		let under = this.lists[secondaryIndex].outer;

		// create clones
		over.clone = over.cloneNode(true);
		under.clone = under.cloneNode(true);

		over.clone.addEventListener('transitionend', this.onSwapped.bind(this, over, under));

		// set original positions and sizes
		this.board.classList.add('scene');
		over.clone.classList.add('clone');
		under.clone.classList.add('clone');
		over.clone.style.top = over.offsetTop + 'px';
		over.clone.style.left = over.offsetLeft + 'px';
		over.clone.style.width = over.offsetWidth + 'px';
		over.clone.style.height = over.offsetHeight + 'px';

		under.clone.style.top = under.offsetTop + 'px';
		under.clone.style.left = under.offsetLeft + 'px';
		under.clone.style.width = under.offsetWidth + 'px';
		under.clone.style.height = under.offsetHeight + 'px';

		// hide originals
		over.style.visibility = 'hidden';
		under.style.visibility = 'hidden';

		// show clones
		this.board.appendChild(over.clone);
		this.board.appendChild(under.clone);

		// make others know they are starting animation
		over.clone.classList.add('animate', 'over');
		under.clone.classList.add('animate', 'under');

		// move clones
		over.clone.style.top = under.offsetTop + 'px';
		over.clone.style.left = under.offsetLeft + 'px';
		under.clone.style.top = over.offsetTop + 'px';
		under.clone.style.left = over.offsetLeft + 'px';

		let direction = mainIndex - secondaryIndex > 0 ? 'left' : 'right';

		this.moveList(mainIndex, Math.abs(mainIndex - secondaryIndex), direction);
	}

	updateStorage() {
		let newData = [];
		this.lists.forEach((list, listIndex) => {
			list = list.item;
			let items = [];

			// 0: order, 1: title, 2: [...items]
			let listData = [listIndex, list.title, items];

			list.itemsArray.forEach((item, itemIndex) => {
				// 0: order, 1: text, 2: complete
				let itemData = [itemIndex, item.text, item.complete];
				items.push(itemData);
			});

			newData.push(listData);
		});
		newData = JSON.stringify(newData);
		localStorage.setItem('todolist', newData);
		console.log('Storage is updated...');
	}

	// Events

	initEvents() {

		if (this.builder.form) {
			this.builder.form.addEventListener('submit', this.onCreateNew.bind(this));
		}

		this.board.addEventListener('todoList.setTitle', this.onTodoListSetTitle.bind(this));
		this.board.addEventListener('todoList.addItem',  this.onTodoListAddItem.bind(this));
		this.board.addEventListener('todoList.remove', 	 this.onTodoListRemove.bind(this));
		this.board.addEventListener('todoList.clear', 	 this.onTodoListClear.bind(this));
		this.board.addEventListener('todoList.move', 	 this.onTodoListMove.bind(this));

		this.board.addEventListener('todoListItem.setStatus', this.onItemSetStatus.bind(this));
		this.board.addEventListener('todoListItem.remove', 	  this.onItemRemove.bind(this));
		this.board.addEventListener('todoListItem.edit', 	  this.onItemEdit.bind(this));

	}

	onCreateNew(event) {
		event.preventDefault();

		this.buildList({
			title: this.builder.input && this.builder.input.value
		});
		this.builder.input.value = '';

		this.updateStorage();
	}

	onTodoListClear(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onTodoListSetTitle(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onTodoListAddItem(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onTodoListRemove(event) {
		for (var i = 0; i < this.lists.length; i++) {
			if (this.lists[i].item == event.detail.todoList) { break; }
		}
		this.lists[i].outer.remove();
		this.lists.splice(i, 1);

		this.updateStorage();
	}

	onTodoListMove(event) {
		let movingList = null;
		let direction = event.detail.direction;

		for (var i = 0; i < this.lists.length; i++) {
			if (this.lists[i].item == event.detail.todoList) {
				movingList = this.lists[i];
				break;
			}
		}

		if (this.isEdge(i, direction)) return;

		if (this.options.moveAnimation) {
			switch(direction) {
				case 'left':
					this.swap(i, i - 1);
					break;
				case 'right':
					this.swap(i, i + 1);
					break;
				default: break;
			}
		} else {
			this.moveList(i, 1, direction);
		}

		this.updateStorage();
	}

	onItemRemove(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onItemEdit(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onItemSetStatus(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onSwapped(over, under) {
		over.style.visibility = 'visible';
		under.style.visibility = 'visible';

		over.clone.remove();
		under.clone.remove();

		this.board.classList.remove('scene');
	}

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoListBuilder;



/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map
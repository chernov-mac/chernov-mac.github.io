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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__js_todoListBuilder_js__ = __webpack_require__(3);


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
        console.log('Registration succeeded. Scope is ' + reg.scope);
    }).catch(function (error) {
        console.log('Registration failed with ' + error);
    });
}

const grid = __webpack_require__(1);
const style = __webpack_require__(2);


// TODO: add JSDoc

let boardElement = document.querySelector('#todo-board');
let desk = new __WEBPACK_IMPORTED_MODULE_0__js_todoListBuilder_js__["a" /* TodoBuilder */](boardElement, {
    boardClasses: 'row-24',
    listOuterClasses: '.col.xxs-24.md-12.lg-8',
    list: {
        titleText: 'New List'
    }
});


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoList_js__ = __webpack_require__(4);
/*
*    JavaScript TodoBuilder
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/



const TodoBuilderDefaults = {
	enableAdding: true,
	boardClasses: '',
	listOuterClasses: 'todo-box-outer',
	builderButtonText: '<i class="material-icons">add</i>',
	list: {} // extends TodoListDefaults
};
/* unused harmony export TodoBuilderDefaults */


class TodoBuilder {

	constructor(builderParentElement, options) {

		this.options = Object.assign({}, TodoBuilderDefaults, options);
		this.options.list = Object.assign({}, TodoBuilderDefaults.list, options.list);

		this.listsArray = [];
		this.data = [];

		this.loadTemplate(builderParentElement);
		this.init();
		this.initEvents();

	}

	loadTemplate(builderParentElement) {
		let template = `
		<div class="todo-builder">
			<div class="todo-builder--bg"></div>
			<div class="content-wrapper">
				<div class="todo-board ${this.options.boardClasses}"></div>
				<button class="btn btn-fab blue action build">${this.options.builderButtonText}</button>
			</div>
		</div>
		`;
		builderParentElement.innerHTML = template;
		this.board = builderParentElement.querySelector('.todo-board');
		this.builderBtn = builderParentElement.querySelector('button.action.build');

		this.listOuterTemplate = this.createOuter(this.options.listOuterClasses);
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
			this.data.forEach(listData => {
				this.build(listData);
			});
		}

		// build empty list if no data set
		if (this.data.length === 0) {
			this.build();
		}

		this.updateStorage();
	}

	parseLocal(data) {
		let parsedLists = JSON.parse(data);

		parsedLists.forEach(list => {
			let listData = {
				title: list[0],
				itemsArray: []
			};
			list[1].forEach(item => {
				let itemData = {
					text: item[0],
					complete: item[1]
				};
				listData.itemsArray.push(itemData);
			});
			this.data.push(listData);
		});
	}

	build(listData) {
		listData = listData || {};

		let outer, outerDeepest = null;

		if (this.options.listOuterClasses) {
			outer = this.listOuterTemplate.cloneNode(true);
			outerDeepest = outer.querySelector('.outer-deepest') || outer;
			outerDeepest.classList.remove('outer-deepest');
			this.board.appendChild(outer);
		}

		let list = new __WEBPACK_IMPORTED_MODULE_0__todoList_js__["a" /* TodoList */](outerDeepest || this.board, listData.itemsArray, this.options.list);

		if (listData.title) { list.title = listData.title; }
		list.outer = outer;

		this.listsArray.push(list);
	}

	isEdge(i, direction) {
		if ((i == 0 && direction == 'left') ||
			(i == this.listsArray.length - 1 && direction == 'right')) {
			return true;
		}
	}

	moveList(i, step, direction) {
		let list = this.listsArray[i];
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

		let slist = this.listsArray[j];

		if (j > i) {
			this.board.insertBefore(slist.outer, list.outer);
		} else {
			this.board.insertBefore(list.outer, slist.outer);
		}

		this.listsArray.splice(i, 1);
		this.listsArray.splice(j, 0, list);
	}

	swap(mainIndex, secondaryIndex) {
		if (mainIndex == secondaryIndex) return;

		if (secondaryIndex > this.listsArray.length - 1) secondaryIndex = 0;
		if (secondaryIndex < 0) secondaryIndex = this.listsArray.length - 1;

		let over = this.listsArray[mainIndex].outer;
		let under = this.listsArray[secondaryIndex].outer;

		// create clones
		over.clone = over.cloneNode(true);
		under.clone = under.cloneNode(true);

		over.clone.addEventListener('transitionend', this.onSwapped.bind(this, over, under));

		// set original positions and sizes
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
		// [...[list.title, ...[item.text, item.complete]]]
		this.listsArray.forEach(list => {
			let items = [];

			// 0: title, 1: [...items]
			let listData = [list.title, items];

			list.itemsArray.forEach(item => {
				// 0: text, 1: complete
				let itemData = [item.text, item.complete];
				items.push(itemData);
			});

			newData.push(listData);
		});
		newData = JSON.stringify(newData);

		localStorage.setItem('todolist', newData);
		console.log('Storage is updated.');
	}

	// Events

	initEvents() {

		this.builderBtn.addEventListener('click', this.onCreateNew.bind(this));

		document.body.addEventListener('todo.list.setTitle',  this.onListSetTitle.bind(this));
		document.body.addEventListener('todo.list.addItem',   this.onListAddItem.bind(this));
		document.body.addEventListener('todo.list.remove',	  this.onListRemove.bind(this));
		document.body.addEventListener('todo.list.clear', 	  this.onListClear.bind(this));
		document.body.addEventListener('todo.list.move', 	  this.onListMove.bind(this));

		document.body.addEventListener('todo.item.setStatus', this.onItemSetStatus.bind(this));
		document.body.addEventListener('todo.item.remove',    this.onItemRemove.bind(this));
		document.body.addEventListener('todo.item.edit', 	  this.onItemEdit.bind(this));

	}

	onCreateNew(event) {
		this.build();
		this.updateStorage();
	}

	onListClear(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onListSetTitle(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onListAddItem(event) {
		// ...some actions for particular event
		this.updateStorage();
	}

	onListRemove(event) {
		for (var i = 0; i < this.listsArray.length; i++) {
			if (this.listsArray[i] == event.detail.list) { break; }
		}
		this.listsArray[i].outer.remove();
		this.listsArray.splice(i, 1);

		this.updateStorage();
	}

	onListMove(event) {
		let movingList = null;
		let direction = event.detail.direction;

		for (var i = 0; i < this.listsArray.length; i++) {
			if (this.listsArray[i] == event.detail.list) {
				movingList = this.listsArray[i];
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
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoBuilder;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__todoItem_js__ = __webpack_require__(5);
/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/



const TodoListDefaults = {
	previewMaxCount: 3,
	// adding
	addIconText: '<i class="material-icons">add_circle</i>',
	placeholder: 'New todo:',
	// title
	titleText: 'Title',
	// tools
	removeToolText: 'Remove',
	clearToolText: 'Clear',
	// other
	readonly: false,
	item: {} // extends TodoItemDefaults
};
/* unused harmony export TodoListDefaults */


const INNER_TEMPLATE = `
<div class="overflow-wrapper">
	<div class="todo-header">
		<h5 class="todo-title" contenteditable="true"></h5>
	</div>
	<div class="todo-body">
		<ul class="todo-list">
			<li class="todo-item add editable">
				<div class="todo-item--icon add"></div>
				<div class="todo-item--text">
					<div class="placeholder"></div>
					<div class="add-box" contenteditable="true"></div>
				</div>
			</li>
		</ul>
	</div>
	<div class="todo-footer">
		<div class="actions">
			<button class="btn btn-flat action clear"></button>
			<button class="btn btn-flat text-red action remove"></button>
		</div>
	</div>
</div>
`;

class TodoList {

	constructor(parentElement, data, options) {
		this.options = Object.assign({}, TodoListDefaults, options);
		/*
		* Second assign is present because Object.assign makes this.options.item
		* just equal to options.item. Need to use Lodash instead.
		*/
		this.options.item = Object.assign({}, TodoListDefaults.item, options.item);

		if (this.options.readonly) {
			this.options.item.editable = false;
			this.options.item.removable = false;
		}

		this.data = data || [];
		this.itemsArray = []; // contains objects of TodoItem

		this.loadTemplate(parentElement);
		this.setList(this.data);
		this.initEvents();
	}

	get title() {
		return this._title;
	}

	set title(value) {
		this._title = value;
		if (this.titleElement != document.activeElement) {
			this.titleElement.innerHTML = value;
		}

		let setTitle = new CustomEvent("todo.list.setTitle", {
			bubbles: true,
			detail: { list: this }
		});
		this.box.dispatchEvent(setTitle);
	}

	get active() {
		return this._active;
	}

	set active(value) {
		// if (!value) {
		// 	let date = new Date();
		// 	date = Date.parse(date);
		// 	console.log('active set false transitionend: ' + date);
		// }
		
		this._active = value;
	}

	loadTemplate(parentElement) {
		this.box = document.createElement('div');
		this.box.classList.add('todobox');
		this.box.innerHTML = INNER_TEMPLATE;

		// set links to box control elements
		this.boxBody      = this.box.querySelector('.todo-body');
		this.list         = this.box.querySelector('.todo-list');
		this.titleElement = this.box.querySelector('.todo-title');
		this.clearTool    = this.box.querySelector('.todo-footer .actions .clear');
		this.removeTool   = this.box.querySelector('.todo-footer .actions .remove');
		this.addItem      = this.box.querySelector('.todo-item.add');
		this.addInput     = this.addItem.querySelector('.add-box');

		// set text
		this.title = this.options.titleText;

		this.clearTool.innerHTML = this.options.clearToolText;
		this.removeTool.innerHTML = this.options.removeToolText;
		this.addItem.querySelector('.placeholder').innerHTML = this.options.placeholder;
		this.addItem.querySelector('.todo-item--icon').innerHTML = this.options.addIconText;

		// load generated boxes
		this.parent = parentElement;
		this.parent.innerHTML = '';
		this.parent.appendChild(this.box);

		this.active = false;
	}

	setList(data) {
		data = data || [];
		this.itemsArray = [];
		this.list.innerHTML = '';
		this.list.appendChild(this.addItem);

		data.forEach((todo) => {
			let item = new __WEBPACK_IMPORTED_MODULE_0__todoItem_js__["a" /* TodoItem */](todo.text, todo.complete, this.options.item);
			this.add(item);
		});
		this.hideOutOfMaxItems();
	}

	add(item) {
		if (this.itemsArray.length == this.options.previewMaxCount) {
			this.createItemMore();
		}

		this.itemsArray.push(item);
		this.list.insertBefore(item.element, this.addItem);

		if (this.active) {
			this.fixBoxBodyHeight();
		} else {
			this.hideOutOfMaxItems();
		}

		let addItem = new CustomEvent("todo.list.addItem", {
			bubbles: true,
			detail: { list: this }
		});
		this.box.dispatchEvent(addItem);
	}

	createItemMore() {
		let moreLine = document.createElement('div');
		moreLine.classList.add('todo-item', 'more');
		moreLine.innerHTML = '<div class="todo-item--text">...</div>';

		this.boxBody.appendChild(moreLine);
	}

	showDialog() {
		this.createDialog();
		this.placeDialogOverBox(this.box);

		// this moves .todobox from it's parent to .dialog
		this.dialog.appendChild(this.box);

		// load clone into parent to save size
		this.clone = this.box.cloneNode(true);
		this.parent.appendChild(this.clone);

		let pos = {
			top: window.pageYOffset + document.documentElement.clientHeight / 2 + 'px',
			left: '50%'
		}
		let size = {
			width: '600px',
			height: 'auto',
			bodyHeight: this.list.offsetHeight + 'px'
		}

		this.showHiddenItems();
		this.animateDialog('show', pos, size);

		this.active = true;
	}

	hideDialog() {
		this.dialog.addEventListener('transitionend', this.destroyDialog.bind(this));
		this.hideOutOfMaxItems();
		this.placeDialogOverBox(this.clone);
	}

	createDialog() {
		this.dialog = document.createElement('div');
		this.dialog.classList.add('dialog');
		this.dialog.innerHTML = '';
		document.body.appendChild(this.dialog);
	}

	placeDialogOverBox(target) {
		let targetPos = target.getBoundingClientRect();
		let targetCenter = {
			top: (targetPos.top + pageYOffset) + target.offsetHeight / 2 + 'px',
			left: (targetPos.left + pageXOffset) + target.offsetWidth / 2 + 'px'
		}

		let size = {
			width: target.offsetWidth + 'px',
			height: 'auto'
		}

		let action = target == this.box ? 'show' : 'hide';
		this.animateDialog(action, targetCenter, size);
	}

	animateDialog(action, pos, size) {
		this.dialog.classList.remove('show', 'hide');
		this.dialog.classList.add('animate', action);

		this.dialog.style.top = pos.top;
		this.dialog.style.left = pos.left;
		this.dialog.style.width = size.width;
		this.dialog.style.height = size.height;


		if (window.innerWidth < 600) {
			this.dialog.style.width = '100%';
		}
	}

	showHiddenItems() {
		var hiddenItems = this.list.querySelectorAll('.todo-item.hidden');
		for (let i = 0; i < hiddenItems.length; i++) {
			hiddenItems[i].classList.remove('hidden');
		}
		this.fixBoxBodyHeight();
	}

	hideOutOfMaxItems() {
		if (this.itemsArray.length > this.options.previewMaxCount) {
			this.itemsArray.forEach((item, i) => {
				if (i >= this.options.previewMaxCount) {
					item.element.classList.add('hidden');
				}
			});
			this.addItem.classList.add('hidden');
		}
		this.fixBoxBodyHeight();
	}

	fixBoxBodyHeight() {
		let height = this.list.offsetHeight;
		if (this.itemsArray.length > this.options.previewMaxCount) {
			height = 0;
			this.itemsArray.forEach((item, i) => {
				if (!item.element.classList.contains('hidden')) {
					height += item.element.offsetHeight;
				}
			});
			height += this.boxBody.querySelector('.more').offsetHeight;
		}
		this.boxBody.style.height = height + 'px';
		this.boxBody.style.maxHeight = window.innerHeight - 300 + 'px';

		return height;
	}

	destroyDialog(event) {
		// 0.375 -- the longest time in CSS transitions animation
		if (event.srcElement == this.dialog && event.elapsedTime == 0.375) {
			this.dialog.removeEventListener('transitionend', this.destroyDialog.bind(this));

			this.clone.remove();
			this.parent.appendChild(this.box);
			this.dialog.remove();
			this.active = false;
		}
	}

	isDialog(elem) {
		if (elem.closest('.dialog') && elem.closest('.dialog').contains(this.dialog)) {
			return true;
		}
		if (elem.closest('.todo-item--icon.remove')) {
			return true;
		}
		return false;
	}

	// Events

	initEvents() {

		this.box.addEventListener('click', this.onPreviewBoxClick.bind(this));
		document.body.addEventListener('click', this.onDocumentClick.bind(this));
		window.addEventListener('resize', this.onWindowResize.bind(this));

		this.list.addEventListener('todo.item.remove', this.onRemoveTodo.bind(this));
		this.list.addEventListener('todo.item.removed', this.onRemovedTodo.bind(this));
		this.titleElement.addEventListener('input', this.onTitleInput.bind(this));

		this.addItem.addEventListener('click', () => { this.addInput.focus(); });
		this.addInput.addEventListener('focus', this.onAddBoxFocus.bind(this));
		this.addInput.addEventListener('blur', this.onAddBoxBlur.bind(this));
		this.addInput.addEventListener('input', this.onAddTodo.bind(this));
		this.clearTool.addEventListener('click', this.onListClear.bind(this));
		this.removeTool.addEventListener('click', this.onListRemove.bind(this));

		this.clearTool.addEventListener('click', this.onListClear.bind(this));
		this.removeTool.addEventListener('click', this.onListRemove.bind(this));
	}

	onPreviewBoxClick(event) {
		if (!this.active &&
			event.target != this.clearTool &&
			event.target != this.removeTool &&
			!event.target.closest('.todo-item--complete')) {
			this.showDialog();
		}
	}

	onDocumentClick(event) {
		if (this.active && !this.isDialog(event.target)) {
			this.hideDialog();
		}
	}

	onWindowResize(event) {
		if (this.active) {
			let pos = {
				top: window.pageYOffset + document.documentElement.clientHeight / 2 + 'px',
				left: '50%'
			}
			let size = {
				width: '600px',
				height: 'auto',
				bodyHeight: this.list.offsetHeight + 'px'
			}
			this.animateDialog('show', pos, size);
			this.fixBoxBodyHeight();
		}
	}

	onRemoveTodo(event) {
		let item = event.detail.item;
		let index = this.itemsArray.indexOf(item);
		this.itemsArray.splice(index, 1);

		if (this.itemsArray.length == this.options.previewMaxCount) {
			this.boxBody.querySelector('.more').remove();
		}
	}

	onRemovedTodo(event) {
		this.fixBoxBodyHeight();
	}

	onAddBoxFocus(event) {
		this.addItem.classList.add('active');
	}

	onAddBoxBlur(event) {
		this.addItem.classList.remove('active');
	}

	onAddTodo(event) {
		let value = this.addInput.innerHTML;

		if (value) {
			let item = new __WEBPACK_IMPORTED_MODULE_0__todoItem_js__["a" /* TodoItem */](value, false, this.options.item);
			this.add(item);

			this.addInput.innerHTML = '';
			this.addItem.classList.remove('active');
			item.textBox.focus();

			item && this.options.onAddTodo && this.options.onAddTodo.call(this, item);
		}
	}

	onTitleInput(event) {
		this.title = this.titleElement.innerHTML;
	}

	onListClear(event) {
		this.setList();

		let clear = new CustomEvent("todo.list.clear", {
			bubbles: true,
			detail: { list: this }
		});
		this.list.dispatchEvent(clear);
	}

	onListRemove(event) {
		let listRemove = new CustomEvent("todo.list.remove", {
			bubbles: true,
			detail: { list: this }
		});
		this.list.dispatchEvent(listRemove);

		this.box.remove();
	}

	placeCaretAtEnd(element) {
		let range, selection;
		range = document.createRange();
		range.selectNodeContents(element);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoList;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
*    JavaScript Autocomplete
*    Author: Vladimir Chernov
*    For KeepSolid Summer Internship 2017
*/

const TodoItemDefaults = {
	editable: true,
	removable: true,
	singleLine: true,
	removeBtnText: '<i class="material-icons">highlight_off</i>'
};
/* unused harmony export TodoItemDefaults */


class TodoItem {

	constructor(text, complete, options) {

		this.options = Object.assign({}, TodoItemDefaults, options);

		this.createElem(); // this.element
		this.initHandlers();

		this.text = text;
		this.complete = complete;
	}

	get text() {
		return this._text;
	}

	set text(value) {
		this._text = value;
		if (this.textBox != document.activeElement) {
			this.textBox.innerHTML = value;
		}

		var itemEdit = new CustomEvent("todo.item.edit", {
			bubbles: true,
			detail: { item: this }
		});
		this.element.dispatchEvent(itemEdit);
	}

	get complete() {
		return this._complete;
	}

	set complete(value) {
		this._complete = value;

		if (value) {
			this.element.classList.add('complete');
			this.checkbox.checked = true;
		} else {
			this.element.classList.remove('complete');
			this.checkbox.checked = false;
		}

		var itemSetStatus = new CustomEvent("todo.item.setStatus", {
			bubbles: true,
			detail: { item: this }
		});
		this.element.dispatchEvent(itemSetStatus);
	}

	createElem() {
		this.element = document.createElement('li');
		this.element.classList.add('todo-item');

		let inner = `
			<label class="todo-item--complete todo-item--icon">
				<input type="checkbox" tabindex="-1">
				<i class="material-icons"></i>
			</label>
			<div class="todo-item--text" contenteditable="${this.options.editable}"></div>
		`;
		this.element.innerHTML = inner;

		this.checkboxLabel = this.element.querySelector('.todo-item--complete');
		this.checkbox = this.element.querySelector('.todo-item--complete input');
		this.textBox = this.element.querySelector('.todo-item--text');

		this.options.editable && this.element.classList.add('editable');
		this.options.singleLine && this.element.classList.add('single-line');

		this.options.removable && this.createRemoveBtn();
	}

	createRemoveBtn() {
		this.removeBtn = document.createElement('button');
		this.removeBtn.classList.add('todo-item--icon', 'remove');
		this.removeBtn.innerHTML = this.options.removeBtnText;
		this.element.appendChild(this.removeBtn);
	}

	initHandlers() {
		this.checkbox.addEventListener('click', this.toggleComplete.bind(this));

		if (this.options.editable) {
			this.textBox.addEventListener('focus', this.onTextBoxFocus.bind(this));
			this.textBox.addEventListener('input', this.onTextBoxInput.bind(this));
			this.textBox.addEventListener('blur', this.onTextBoxBlur.bind(this));
		}

		if (this.options.removable) {
			this.removeBtn.addEventListener('click', this.onRemove.bind(this));
		}
	}

	toggleComplete(event) {
		this.complete = !this.complete;
	}

	onRemove(event) {
		var itemRemove = new CustomEvent("todo.item.remove", {
			bubbles: true,
			detail: { item: this }
		});
		this.element.dispatchEvent(itemRemove);

		let parent = this.element.parentElement
		this.element.remove();this.element.parentElement

		var itemRemoved = new CustomEvent("todo.item.removed", {
			bubbles: true,
			detail: { item: this }
		});
		parent.dispatchEvent(itemRemoved);
	}

	onTextBoxFocus(event) {
		this.element.classList.add('active');
		this.placeCaretAtEnd(this.textBox);
	}

	onTextBoxBlur(event) {
		if (this.textBox.innerHTML == '') {
			this.onRemove();
			return;
		}

		this.element.classList.remove('active');
	}

	onTextBoxInput(event) {
		this.text = this.textBox.innerHTML;
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

	placeCaretAtEnd(element) {
		let range, selection;
		range = document.createRange();
		range.selectNodeContents(element);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TodoItem;



/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map
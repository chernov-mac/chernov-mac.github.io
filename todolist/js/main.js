/*jslint esversion: 6 */
/*jslint node: true */
/*global document, alert, fetch, Autocomplete, Chips, countriesData*/

'use strict';

var _autocomplete = require("./autocomplete.js");

var _chips = require("./chips.js");

// TODO: add JS Doc

var autocompleteInputs = document.querySelectorAll('.present-autocomplete');
var chipsInputs = document.querySelectorAll('.present-chips');

autocompleteInputs = Array.prototype.slice.call(autocompleteInputs);
chipsInputs = Array.prototype.slice.call(chipsInputs);

autocompleteInputs.forEach(function (curInput) {
    var dataSource = curInput.dataset.src;
    curInput.parentNode.classList.add('loading'); // preloader

    getData(dataSource, curInput).then(function (result) {
        var data = Object.keys(result).map(function (key) {
            return result[key];
        });

        new _autocomplete.Autocomplete(curInput, data, {
            onSelect: function onSelect(value) {
                curInput.value = value;
                alert(value);
            }
        });
        console.log('resaved');
    });
});

chipsInputs.forEach(function (curInput) {
    var dataSource = curInput.dataset.src;
    curInput.parentNode.classList.add('loading'); // preloader

    getData(dataSource, curInput).then(function (result) {
        var data = Object.keys(result).map(function (key) {
            return result[key];
        });

        new _chips.Chips(curInput, data, {
            onSelect: function onSelect(result) {
                var str = '<span>' + result.join('</span>, <span>') + '</span>';
                document.querySelector('.result[data-for="#' + curInput.getAttribute('id') + '"]').innerHTML = str;
            }
        });
    });
});

function getData(dataString, curInput) {
    switch (dataString) {
        case 'countries-cors':
            return fetch('https://crossorigin.me/http://country.io/names.json', {
                mode: 'cors'
            }).then(function (result) {
                curInput.parentNode.classList.remove('loading');
                return result.json();
            });
        default:
            curInput.parentNode.classList.remove('loading');
            return new Promise(function (resolve, reject) {
                resolve(countriesData);
            });
    }
}
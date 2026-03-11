var psalmApp = new Vue({
	el: '#app',

	data: {
		ajaxUrl: '/ajax/index.php',
		sending: false,
		currentDate: null,
		clearCache: false,
		marks: {
			insertPrayers: false
		},
		page: {
			index: '',
			caption: ''
		},
		options: {
			lang: {
				current: 'slav',
				name: 'Язык текста',
				values: [
					{
						index: 'slav',
						name: 'Церковнославянский'
					},
					{
						index: 'rus',
						name: 'Русский'
					}
				]
			},
			font: {
				current: 'tipikon',
				name: 'Русский шрифт',
				values: [
					{
						index: 'system',
						name: 'Системный'
					},
					{
						index: 'tipikon',
						name: 'Типикон'
					}
				]
			},
			fontSize: {
				current: 'middle',
				name: 'Размер шрифта',
				values: [
					{
						index: 'little',
						name: 'Наименьший'
					},
					{
						index: 'small',
						name: 'Маленький'
					},
					{
						index: 'middle',
						name: 'Средний'
					},
					{
						index: 'big',
						name: 'Большой'
					},
					{
						index: 'large',
						name: 'Максимальный'
					}
				]
			},
			theme: {
				current: 'white',
				name: 'Цветовая тема',
				values: [
					{
						index: 'white',
						name: 'Светлая, серая'
					},
					{
						index: 'biege',
						name: 'Светлая, бежевая'
					},
					{
						index: 'dark',
						name: 'Тёмная'
					}
				]
			}
		},
		font: 'system',
		fontSize: '18',
		reader: {
			text: '',
			caption: ''
		},
		prayerBook: [],
		psalter: {
			kathismas: null,
			readRules: null,
			prayers: null,
			glories: {
				slav: [
					'',
					'',
					'<p class="red">Слaва, и нhнэ:</p>',
					'<p class="red">Слaва, и нhнэ:</p>',
					'<p class="red">Слaва, и нhнэ:</p>'
				],
				rus: [
					'',
					'',
					'<p class="red">Слaва, и ныне:</p>',
					'<p class="red">Слaва, и ныне:</p>',
					'<p class="red">Слaва, и ныне:</p>'
				]
			}
			
		},
		selectModeMenuItems: [
			{
				name: "Псалтирь",
				index: "select-psalm",
				visible: true
			},
			{
				name: "Молитвослов",
				index: "select-prayer",
				visible: true
			},
			{
				name: "Читать кафизму по порядку",
				index: "select-reader",
				visible: false
			}
		],
		showTodayLink: false
	},

	methods: {
		// Отправка запроса на сервер
		sendRequest: function(data, callback, file = false) {
			var self = this;
			let formData = new FormData();
			formData.append('data', JSON.stringify(data));

			if (file) {
				formData.append('file', file);
			}

			if (self.sending) return;
			self.sending = true;
			fetch(self.ajaxUrl, {
				method: 'POST',
				body: formData
			}).then(function (response) {
				response.json().then(function (result) {
					self.sending = false;
					callback(result);
				});
			});
		},

		// Сохранение настроек
		saveOptions: function() {
			let self = this;

			setCookie('options', JSON.stringify({
				lang: self.options.lang.current,
				font: self.options.font.current,
				fontSize: self.options.fontSize.current,
				theme: self.options.theme.current
			}), 365);
		},

		// Загрузка настроек
		loadOptions: function() {
			let self = this;
			let options = getCookie('options');
			if (options) {
				options = JSON.parse(options);
				self.options.lang.current = options.lang;
				self.options.font.current = options.font;
				self.options.fontSize.current = options.fontSize;
				self.options.theme.current = options.theme;
			}
		},

		// Инициализация
		init: function() {
			let self = this;
			let url = new URL(window.location);
			let ruleName = url.searchParams.get('rule');
			let lastUpdate = localStorage.getItem('last_update');

			if (!ruleName) ruleName = getCookie('kathisma_read_rule');

			self.loadOptions();

			self.currentDate = new Date();
			self.setPage('select-mode');
			self.loadBooks(function() {
				if (ruleName) {
					setCookie('kathisma_read_rule', ruleName, 60);
					self.loadReadRules(ruleName); // Загрузка данных о порядке чтения
				} else {
					self.route();
				}
			});

			if (self.currentDate.getTime() - (new Date(lastUpdate)).getTime() < 3000) {
				console.log('update!');
				self.clearCache = true;
			}

			window.addEventListener("popstate", (event) => {  
				self.back(event.state);
			});

			window.focus = function() {
				if (self.page.index == 'read-by-rule') {
					let now = new Date();
				
					now.setHours(0);
					now.setMinutes(0);
					now.setSeconds(0);
					now.setMilliseconds(0);
					
					if (now > self.currentDate) {
						self.showTodayLink = true;
					}
				}
			};

			document.addEventListener('swiped-right', function(e) {
				e.target.classList.add('marked');
				console.log('!');
			});
			
			document.addEventListener('swiped-left', function(e) {
				e.target.classList.remove('marked');
			});

			localStorage.setItem('last_update', self.currentDate);
		},


		// Маршрутизация
		route: function() {
			let self = this;

			if (window.path) {
				let pathChunks = window.path.split('/');
				let method = pathChunks[0];
				let index = pathChunks[1];

				// Параметры маршрутизации
				routeParams = {
					'select-psalm': function() {
						self.setPage(self.selectModeMenuItems[0].index, self.selectModeMenuItems[0].name);
					},
					'select-prayer': function() {
						self.setPage(self.selectModeMenuItems[1].index, self.selectModeMenuItems[1].name);
					},
					'read-psalm': function() {
						if (!!index) {
							self.setPage(self.selectModeMenuItems[0].index, self.selectModeMenuItems[0].name);
							self.readPsalm(index);
						}
					},
					'read-prayer': function() {
						self.setPage(self.selectModeMenuItems[1].index, self.selectModeMenuItems[1].name);
						let prayer = self.prayerBook.find(function(item) {
							return item.path == index;
						});
						self.readPrayer(prayer);
					},
					'read-kathisma': function() {
						if (!!index) {
							self.setPage(self.selectModeMenuItems[0].index, self.selectModeMenuItems[0].name);
							self.readKathisma(self.psalter.kathismas[index], index);
						}
					},
					'read-by-rule': function() {
						if (!!index) {
							self.setPage(self.selectModeMenuItems[2].index, self.selectModeMenuItems[2].name);
							self.readByRule(index);
						}
					},
					'select-reader': function() {
						self.setPage(self.selectModeMenuItems[2].index, self.selectModeMenuItems[2].name);
					}
				}

				if (typeof(routeParams[method]) != 'undefined') {
					routeParams[method]();
				}
			}
		},

		// Переход между страницами
		setPage: function(index, caption, urlSuffix) {
			let self = this;
			let url = (index == 'select-mode') ? '/' : index;
			if (urlSuffix) url = url + '/' + urlSuffix;
			self.page.index = index;
			self.page.caption = caption;
			history.pushState(Object.assign({}, self.page), self.page.caption, url);
			window.scrollTo(0, 0);
		},

		back: function(state) {
			let self = this;
			self.page.index = state.index;
			self.page.caption = state.caption;
		},

		// Загрузить данные о кафизмах
		loadBooks: function(callback = false) {
			let self = this;
			let key ='books';
			let cache = localStorage.getItem(key);

			if (cache && !self.clearCache) {
				cache = JSON.parse(cache);
				self.psalter.kathismas = cache.kathismas;
				self.prayerBook = cache.prayerBook;
				if (callback) callback();
			} else {
				self.sendRequest({
					action: 'loadBooks'
				}, function(response) {
					localStorage.setItem(key, JSON.stringify({
						kathismas: Object.assign({}, response.data.kathismaStructure),
						prayerBook: Object.values(response.data.prayerBook)
					}));

					self.psalter.kathismas = Object.assign({}, response.data.kathismaStructure);
					self.prayerBook = Object.values(response.data.prayerBook);

					if (callback) callback();
				})
			}
		},

		// Рассчитать разницу в днях для чтения по порядку
		calcReadRules: function() {
			let self = this;
			let now = new Date();
			let startDate =  new Date(self.psalter.readRules.date);
			let endDate = new Date(self.psalter.readRules.dateEnd);

			self.psalter.readRules.startDate = startDate;
			self.psalter.readRules.waiting = startDate > now;
			self.psalter.readRules.finished = endDate < now;
			self.psalter.readRules.diffDays = parseInt((now - startDate) / (1000 * 60 * 60 * 24));

			if (self.psalter.readRules.finished) {
				setCookie('kathisma_read_rule', '', 0);
			}
		},

		// Загрузить данные о порядке чтения
		loadReadRules: function(ruleName) {
			let self = this;
			self.sendRequest({
				action: 'loadReadRules',
				ruleName: ruleName
			}, function(response) {
				if (response.status == true) {
					self.psalter.readRules = Object.assign({}, response.data);
					
					let menuItem = self.selectModeMenuItems.find(function(item) {
						return item.index == 'select-reader';
					});
					menuItem.visible = true;

					self.calcReadRules();

					self.route();
				}
			})
		},

		// Загрузка текста молитв
		loadPrayers: function(callback = false) {
			let self = this;

			self.sendRequest({
				action: 'loadPrayers',
				index: self.psalter.readRules.prayers,
				lang: self.options.lang.current
			}, function(response) {
				if (response.status == true) {
					self.psalter.prayers = response.data;
					if (callback) callback();
				}
			});
		},

		// Загрузить текст из файлов
		loadText: function(filePaths = [], callback = false) {
			let self = this;
			let key = crc32(JSON.stringify(filePaths));
			let cache = localStorage.getItem(key);
			if (cache && !self.clearCache) {
				self.reader.text = cache;
				if (callback) callback();
			} else {
				self.sendRequest({
					action: 'loadText',
					filePaths: filePaths
				}, function(response) {
					localStorage.setItem(key, response.data);
	
					self.reader.text = response.data;
					if (callback) callback();
				})
			}
		},

		// Загрузить текст кафизмы
		loadKathisma: function(kathisma, index, callback = false) {
			let self = this;
			let filePaths = [];

			kathisma.forEach(psalmIndex => {
				filePaths.push('/psalms/' + self.options.lang.current + '/' + psalmIndex + '.html');
			});
			filePaths.push('/prayers/kathisma/' + self.options.lang.current + '/' + index + '.html');

			self.loadText(filePaths, function() {
				//self.setPage('read', 'Кафизма ' + index, 'kathisma-' + index);
				if (callback) callback();
			});
		},

		// Подстановка текста молитв в кафизму
		prayersInclude: function(prayers) {
			let self = this;

			let html = new DOMParser().parseFromString(self.reader.text, 'text/html');

			if (prayers[1]) {
				html.getElementById('inc-1').innerHTML = prayers[1];
			}
			if (prayers[2]) {
				html.getElementById('inc-2').innerHTML = prayers[2];
				let targetEl = html.getElementById('readers-health');

				if (targetEl) {
					self.psalter.readRules.readers.forEach(reader => {
						reader.health.forEach((name, i) => {
							let str = html.createElement('p');
							if (i == 0) {
								str.innerText = reader.index + '. ' + name + ',';
								str.classList.add('name');
							} else {
								str.innerText = name + ',';
							}
							targetEl.appendChild(str);
						});
					});
				}
			}
			if (prayers[3]) {
				html.getElementById('inc-3').innerHTML = prayers[3];
				let targetEl = html.getElementById('readers-memory');

				if (targetEl) {
					self.psalter.readRules.readers.forEach(reader => {							
						
						if (!!reader.memory) {
							let str = html.createElement('p');
							str.classList.add('name');
							str.innerText = '- ' + reader.index + ' -';
							targetEl.appendChild(str);
							reader.memory.forEach(name => {
								let str = html.createElement('p');
								str.innerText = name + ',';
								targetEl.appendChild(str);
							});
						}
					});
				}
			}
			if (prayers[4]) {
				html.getElementById('inc-4').innerHTML = prayers[4];
			}

			self.reader.text = html.body.innerHTML;
		},

		// Чтение молитвы
		readPrayer: function(prayer) {
			let self = this;

			self.loadText(['/prayer-book/' + self.options.lang.current + '/' + prayer.path + '.html'], function() {
				self.setPage('read-prayer', prayer.name, prayer.path);
			});
		},

		// Чтение псалма
		readPsalm: function(index) {
			let self = this;

			self.loadText(['/psalms/' + self.options.lang.current + '/' + index + '.html'], function() {
				self.setPage('read-psalm', 'Псалом ' + index, index);
			});
		},

		// Чтение кафизмы
		readKathisma: function(kathisma, index) {
			let self = this;
			self.loadKathisma(kathisma, index, function() {
				self.setPage('read-kathisma', 'Кафизма ' + index, index);
				self.prayersInclude(self.psalter.glories[self.options.lang.current]);
			});
		},

		// Чтение кафизмы по порядку
		readByRule: function(index) {
			let self = this;
			let navigate = true;

			if (self.psalter.readRules.waiting) {
				alert('Чтение начнется через ' + (Math.abs(self.psalter.readRules.diffDays) + 1) + ' д.');
				return;
			}

			if (self.psalter.readRules.finished) {
				alert('Чтение Псалтири по порядку завершилось.');
				return;
			}

			if (!index) {
				index = getCookie('reader_index');
				navigate = false;
			} else {
				setCookie('reader_index', index, 60);
			}

			index = parseInt(index);
			if (!index) return;
			self.calcReadRules();

			let kathismaNum = index + self.psalter.readRules.diffDays - 1;
			kathismaNum = Math.abs(kathismaNum) % (self.psalter.readRules.readers.length) + 1;

			// Проверить, будет ли правильная разница во второй половине дня
			self.loadPrayers(function() {
				self.loadKathisma(self.psalter.kathismas[kathismaNum], kathismaNum, function() {
					if (navigate) {
						self.setPage('read-by-rule', 'Кафизма ' + kathismaNum, index);
						self.page.caption = self.page.caption + ' (чтение по порядку, день ' + (self.psalter.readRules.diffDays + 1) + ')';
					} else {
						self.page.caption = 'Кафизма ' + kathismaNum + ' (чтение по порядку, день ' + (self.psalter.readRules.diffDays + 1) + ')';
					}
					
					self.prayersInclude(self.psalter.prayers);
				});
			});
		}
	}
});

psalmApp.init();
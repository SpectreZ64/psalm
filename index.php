<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Псалтирь</title>
		<link rel="icon" type="image/x-icon" href="/asset/images/favicon.ico">
		<meta property="og:image" content="/asset/images/favicon.png">
		<meta property="og:title" content="Чтение Псалтири">
		<meta property="og:description" content="Web-приложение для чтения Псалтири с молитвами по порядку на церковнославянском и русском языках">
	</head>
	<body onscroll="window.focus()">
		<script src="/asset/js/vue@2.7.8.8.js"></script>
		<script src="/asset/js/swiped-events.js"></script>
		<script src="/asset/js/routine.js?v=<?= filemtime(__DIR__ . '/asset/js/routine.js') ?>"></script>
		<link href="/asset/css/index.css?v=<?= filemtime(__DIR__ . '/asset/css/index.css') ?>" rel="stylesheet">
        <div id="app" :class="options.theme.current" v-cloak>
			<div class="top-panel">
				<a href="javascript:void(0);" class="button button--back" v-if="page.index != 'select-mode'" @click="history.back()"></a>
				<a href="javascript:void(0);" class="button button--options" v-if="page.index == 'select-mode'" @click="setPage('options', 'Настройки')"></a>
				<h3 @dblclick="showTodayLink = true">{{ page.caption }}</h3>
			</div>

			<div class="today-link" @click="window.location.href = window.location.href" v-if="showTodayLink">Перейти к кафизме на сегодня</div>

            <div class="menu-wrapper menu-wrapper--selectMode" v-if="page.index == 'select-mode'">
				<div class="menu menu--mode">
					<div class="menu__item" v-for="item in selectModeMenuItems" v-if="item.visible">
						<a href="javascript:void(0);" @click="setPage(item.index, item.name)">{{ item.name }}</a>
					</div>
				</div>
			</div>

			<div class="menu-wrapper menu-wrapper--selectPsalm" v-if="page.index == 'select-psalm'">
				<div class="menu menu--kathisma" v-if="psalter.kathismas">
					<div class="menu__items-group" v-for="(kathisma, i) in psalter.kathismas">
						<div class="menu__item menu__item--kathisma">
							<a href="javascript:void(0);" @click="readKathisma(kathisma, i)">Кафизма {{ i }}</a>
						</div>
						<div class="menu__item" v-for="index in kathisma">
							<a href="javascript:void(0);" @click="readPsalm(index)">Псалом {{ index }}</a>
						</div>
					</div>
				</div>
			</div>

			<div class="menu-wrapper menu-wrapper--selectPsalm" v-if="page.index == 'select-prayer'">
				<div class="menu menu--kathisma" v-if="prayerBook">
					<div class="menu__items-group" v-for="prayer in prayerBook">
						<div class="menu__item menu__item--prayer">
							<a href="javascript:void(0);" @click="readPrayer(prayer)">{{ prayer.name }}</a>
						</div>
					</div>
				</div>
			</div>

			<div class="menu-wrapper menu-wrapper--selectReader" v-if="page.index == 'select-reader'">
				<div class="menu menu--reader" v-if="psalter.readRules.readers.length > 0">
					<p class="info">Дата начала чтения:<br><strong>{{ psalter.readRules.startDate.yyyymmdd() }}</strong><br><span v-if="!psalter.readRules.finished && !psalter.readRules.waiting">(день {{ psalter.readRules.diffDays + 1 }})</span></p>
					<p class="info" v-if="psalter.readRules.finished"><strong>Чтение Псалтири по порядку завершилось.</strong></p>
					<p class="info" v-if="psalter.readRules.waiting"><strong>Чтение Псалтири по порядку начнётся через {{ psalter.readRules.diffDays + 1 }} д.</strong></p>
					<div v-if="!psalter.readRules.finished && !psalter.readRules.waiting">
						<p class="info">Выберите свой номер по порядку:</p>
						<div class="menu__item" v-for="reader in psalter.readRules.readers">
							<a href="javascript:void(0);" @click="readByRule(reader.index)">{{ reader.index }}.&nbsp;{{ reader.name }}</a>
						</div>
					</div>
				</div>
			</div>

			<div class="text-wrapper" v-if="page.index.indexOf('read') == 0" :class="'font-size-' + options.fontSize.current">
				<div class="text" v-html="reader.text" :class="'lang-' + options.lang.current + ' ' + 'font-' + options.font.current + ' ' + page.index"></div>
			</div>

			<transition name="fade">
			<div class="menu-wrapper menu-wrapper--options" v-if="page.index == 'options'">
				<div class="menu">
					<div class="menu__items-group" v-for="(option, key) in options">
						<div class="menu__title">
							<span>{{ option.name }}</span>
						</div>
						<div class="site-radio" v-for="val in option.values">
							<input type="radio" :id="key + '-' + val.index" :value="val.index" v-model="option.current" @change="saveOptions()">
							<label :for="key + '-' + val.index"><span>{{ val.name }}</span></label>
						</div>
					</div>
				</div>
			</div>
			</transition>
        </div>
		<script>
			window.path = "<?= $_GET['path'] ?>";
		</script>
        <script src="/asset/js/index.js?v=<?= filemtime(__DIR__ . '/asset/js/index.js') ?>"></script>
    </body>
</html>
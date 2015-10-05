$(document).ready(function(){

  var MAGIC_WORD = 'sparky';

  var WordTranslator = function(options) {
    $("#word_translator_results").html('');
    this.recognition = this.recognition || new webkitSpeechRecognition();
    this.recognition.continuous = options.continuous || true;
    this.recognition.interimResults = options.interimResults || true;
    // this.recognition.lang = 'fr';
    this.manager = options.manager;
    this.recognition.onresult = function(event){
      // console.log(event);
      if ( typeof(event.results) === 'undefined'){
        this.recognition.onend = null;
        this.recognition.stop();
        return;
      }

      for (var i = event.resultIndex; i < event.results.length; ++i){
        var transcript = event.results[i][0].transcript;
        if ( typeof(transcript) === 'undefined' || transcript === 'undefined'){
          continue;
        }
        console.log(transcript);
        if (event.results[i].isFinal){
          this.final_transcript += transcript;
          // $("#translation").append(this.final_transcript);
          // checkForMagicWord(this.final_transcript);
          this.final_transcript = this.final_transcript.replace('undefined', '');
          $("#word_translator_results").append(this.final_transcript);
          translate(this.final_transcript.trim());
          this.stop();
        } else {
          this.interim_transcript += transcript;
        }
      }
    };

    var self = this;

    this.recognition.onend = function(){
      self.manager.start();
    };

    this.interim_transcript = '';
    this.final_transcript = '';
    this.to_translate = '';

  };

  WordTranslator.prototype.start = function() {
    this.recognition.start();
  };

  WordTranslator.prototype.stop = function() {
    this.recognition.stop();
  };

  var SpeechManager = function(options){
    var permission = false;
    this.recognition = this.recognition || new webkitSpeechRecognition();
    this.recognition.continuous = options.continuous || true;
    this.recognition.interimResults = options.interimResults || true;
    this.recognition.onstart = function(){
      permission = true;
    };


    this.recognition.onresult = function(event) {
      // console.log(event);
      if ( typeof(event.results) === 'undefined'){
        this.recognition.onend = null;
        this.recognition.stop();
        return;
      }

      for (var i = event.resultIndex; i < event.results.length; ++i){
        var transcript = event.results[i][0].transcript;
        if ( typeof(transcript) === 'undefined'){
          continue;
        }
        // console.log(transcript);
        if (event.results[i].isFinal){
          this.final_transcript += transcript;
          this.final_transcript = this.final_transcript.replace('undefined', '');
          $("#speech_manager_results").append(this.final_transcript + ' ');
          checkForMagicWord(this.final_transcript, this);
          // translate(this.final_transcript);
        } else {
          this.interim_transcript += transcript;
        }
      }
    };

    this.recognition.onend = function(){
      // this.start();
    };

    this.interim_transcript = '';
    this.final_transcript = '';
    this.to_translate = '';

    // this.start();
    // 
  };

  SpeechManager.prototype.start = function() {
    this.recognition.start();
  };

  SpeechManager.prototype.stop = function() {
    this.recognition.stop();
  };

  var cleanFinalText = function(text){
    console.log('cleanFinalText');
    console.log(text);

    // text = text.toLowerCase();
    // 
    var inputLanguage = getInputLanguage();
    if (inputLang == 'en'){
      text = text.split('say')[1] || text;
    } else if (inputLang === 'fr'){
      text = text.split('dit-on')[1] || text;
    }
    text = text.replace('undefined', '');
    // text = text.replace('in french', '');
    return text;
  };

  var getLangAndText = function(text){
    var langAndText = [];
    if (text.indexOf('french') > -1){
      langAndText.push('fr');
      text = text.replace('in french', '');
      text = text.replace('french', '');
      langAndText.push(text);
    }
    else if (text.indexOf('marathi') > -1){
      langAndText.push('mr');
      text = text.replace('in marathi', '');
      text = text.replace('marathi', '');
      langAndText.push(text);
    } else if (text.indexOf('italian', '') > -1){
      langAndText.push('it');
      text = text.replace('in italian', '');
      text = text.replace('italian', '');
      langAndText.push(text);
    } else if (text.indexOf('spanish') > -1){
      langAndText.push('es');
      text = text.replace('in spanish', '');
      text = text.replace('spanish', '');
      langAndText.push(text);
    } else if (text.indexOf('anglais') > -1){
      langAndText.push('en');
      text = text.replace('en anglais', '');
      text = text.replace('anglais', '');
      langAndText.push(text);
    }
    return langAndText;
  };

  var translate = function(text){
    console.log('translate');
    console.log(text);
    text = text.toLowerCase();
    // text = text.splice(0, 1024);  //truncate in case input is massive
    var langAndText = getLangAndText(text);
    var targetLang = langAndText[0];
    text = langAndText[1];
    text = cleanFinalText(text);

    console.log(text);

    if (text.length < 1){
      return;
    }

    $.ajax('https://www.googleapis.com/language/translate/v2?key=AIzaSyDD3y8TUtYeonYgFDw8G5fqQtN8YZFr4Dw&source=en&target=' + targetLang + '&q=' + encodeURIComponent(text), {
      type: 'get',
      success: function(r){
        if (r.data.translations.length > 0){
          var translation = r.data.translations[0].translatedText;
          $('#translation').html(text + ' = ' + translation);
          speakTranslation(translation, targetLang);
        }
      },
      error: function(e){
        console.log(e);
      }
    });


  };

  var speakTranslation = function(text, targetLang){
    $.ajax('http://translate.google.com/translate_tts?key=AIzaSyDD3y8TUtYeonYgFDw8G5fqQtN8YZFr4Dw&ie=UTF-8&tl=' + targetLang + '&q=' + text, {
      type: 'get',
      headers: {
        'Content-type': 'audio/mpeg',
        'Content-Transfer-Encoding': 'binary',
        'Expires': '0'
      },
      success: function(){

      }
    });
    var audio = $('<audio />');
    var source = $('<source />', {
      'src': 'http://translate.google.com/translate_tts?key=AIzaSyDD3y8TUtYeonYgFDw8G5fqQtN8YZFr4Dw&ie=UTF-8&tl=' + targetLang + '&q=' + text
    });
    audio.append(source);
    $(document.body).append(audio);
  }

  var inputLang = 'en';

  var getInputLanguage = function(){
    return inputLang;
  };

  var setInputLanguage = function(text){
    if (text.indexOf('french') > 0){
      inputLang = 'fr';
    }
  };

  var checkForMagicWord = function(text, speechManager){
    debugger
    text = text.toLowerCase();
    if (text.indexOf(MAGIC_WORD) > -1){
      console.log('why hello');
      var wordTranslator = new WordTranslator({
        manager: speechManager
      });
      wordTranslator.start();
    }
  };

  var speechManager = new SpeechManager({});
  speechManager.start();



});
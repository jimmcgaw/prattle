$(document).ready(function(){

  var LanguageSelector = function(selector){
    this.select = $(selector || '#input_language');
    var langs = [
      {'name': 'English', 'code': 'en'},
      {'name': 'French', 'code': 'fr'},
      {'name': 'Spanish', 'code': 'es'}
    ];
    var self = this;

    _.each(langs, function(lang){
      var option = $("<option />");
      option.text(lang.name);
      option.val(lang.code);
      $('#input_language').append(option);
    });

  };

  LanguageSelector.prototype.setLanguage = function(newLanguage) {
    $("#input_language").val(newLanguage);

  };

  var languageSelector = new LanguageSelector({});

  var Translator = function(options){
    this.clear();
    console.log('Translator init with: ', options);
    this.interpreter = options.interpreter;
    this.source_lang = options.source_lang;

    this.recognition = this.recognition || new webkitSpeechRecognition();
    this.recognition.continuous = options.continuous || true;
    this.recognition.interimResults = options.interimResults || true;
    this.translation = '';
    this.recognition.lang = options.source_lang;

    var self = this;

    this.recognition.onresult = function(event){
      console.log(event);
      if ( typeof(event.results) === 'undefined'){
        self.recognition.onend = null;
        self.recognition.stop();
        return;
      }

      for (var i = event.resultIndex; i < event.results.length; ++i){
        var transcript = event.results[i][0].transcript;
        if ( typeof(transcript) === 'undefined'){
          continue;
        }
        // console.log(transcript);
        if (event.results[i].isFinal){
          console.log(transcript);
          self.text += transcript;
          self.text = self.text.replace('undefined', '');

          $('#interpreter_results').val(transcript);

          self.translate();

        }
      }
    }


  };

  Translator.prototype.clear = function() {
    $('#interpreter_results').val('');
    $('#translation').val('');
  };

  Translator.prototype.start = function() {
    this.recognition.start();
  };

  Translator.prototype.stop = function() {
    this.recognition.stop();
  };

  Translator.prototype.clean = function() {
    this.text = this.text.toLowerCase();
    var inputLang = $('#input_language').val();
    if (inputLang == 'en'){
      this.text = this.text.split('say')[1] || text;
      this.text = this.text.replace('in marathi', '');
      this.text = this.text.replace('marathi', '');
      this.text = this.text.replace('in french', '');
      this.text = this.text.replace('french', '');
      this.text = this.text.replace('in spanish', '');
      this.text = this.text.replace('spanish', '');
    } else if (inputLang === 'fr'){
      this.text = this.text.split('dit-on')[1] || text;
      this.text = this.text.replace('en anglais', '');
      this.text = this.text.replace('anglais', '');
    } else if (inputLang === 'es'){
      this.text = this.text.split('dice')[1] || text;
      this.text = this.text.replace('en inglés');
      this.text = this.text.replace('inglés');
    }
    this.text = this.text.replace('undefined', '');
  };

  Translator.prototype.sniffTargetLanguage = function() {
    var text = this.text.toLowerCase();
    console.log('sniffTargetLanguage');
    console.log(text);
    if (text.indexOf('french') > -1){
      this.target_lang = 'fr';
    } else if ( text.indexOf('spanish') > -1){
      this.target_lang = 'es';
    } else if ( text.indexOf('marathi') > -1){
      this.target_lang = 'mr';
    } else if ( text.indexOf('anglais') > -1){
      this.target_lang = 'en';
    } else if ( text.indexOf('inglés') > -1){
      this.target_lang = 'en';
    }
  };

  Translator.prototype.translate = function() {
    this.sniffTargetLanguage();
    var self = this;
    this.clean();
    $.ajax('https://www.googleapis.com/language/translate/v2?key=AIzaSyDD3y8TUtYeonYgFDw8G5fqQtN8YZFr4Dw&source=' + self.source_lang + '&target=' + self.target_lang + '&q=' + encodeURIComponent(self.text), {
      type: 'get',
      success: function(r){
        if (r.data.translations.length > 0){
          var translation = r.data.translations[0].translatedText;
          self.translation = translation;
          $('#translation').val(self.text + ' = ' + self.translation);
          // speakTranslation(translation, targetLang);
          self.interpreter.finishTranslation();
        }
      },
      error: function(e){
        console.log(e);
      }
    });
  };

  var renderTranslation = function(translation){

  };


  var Interpreter = function(options){
    this.text = options.text.toLowerCase();
    this.manager = options.manager;
    this.magic_word = 'dog';
    this.is_translating = false;
  };

  Interpreter.prototype.containsMagicWord = function() {
    return this.text.indexOf(this.magic_word) > -1;
  };

  Interpreter.prototype.process = function() {
    if (this.containsMagicWord()){
      this.processCommand();
    }
  };

  Interpreter.prototype.processCommand = function(){
    var text = this.text.toLowerCase();
    if (text.indexOf('french') > -1){
      languageSelector.setLanguage('fr');
    } else if (text.indexOf('english') > -1){
      languageSelector.setLanguage('en');
    } else if (text.indexOf('spanish') > -1){
      languageSelector.setLanguage('es');
    } else {
      this.processTranslation();
    }
  };

  Interpreter.prototype.processTranslation = function() {
    this.is_translating = true;
    var sourceLang = $('#input_language').val();
    var translator = new Translator({
      source_lang: sourceLang,
      interpreter: this
    });
    translator.start();
  };

  Interpreter.prototype.finishTranslation = function(){
    this.is_translating = false;
    this.manager.start();
  };



  var SpeechManager = function(options){
    var self = this;
    this.recognition = this.recognition || new webkitSpeechRecognition();
    this.recognition.continuous = options.continuous || true;
    this.recognition.interimResults = options.interimResults || true;
    this.final_transcript = '';


    this.recognition.onresult = function(event) {
      console.log(event);
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
          $("#speech_manager_results").val(this.final_transcript + ' ');
          var interpreter = new Interpreter({
            text: this.final_transcript,
            manager: this
          });
          interpreter.process();
          this.final_transcript = '';

        } else {
          // this.interim_transcript += transcript;
        }
      }
    };

    // this.start();
    //
  };

  SpeechManager.prototype.start = function() {
    this.recognition.start();
  };

  SpeechManager.prototype.stop = function() {
    this.recognition.stop();
  };

  var speechManager = new SpeechManager({});
  speechManager.start();
});

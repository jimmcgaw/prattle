'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  var React = require('react');
  var ReactDOM = require('react-dom');

  var searchInputStyles = {
    'height': '25px',
    'width': '600px'
  };

  var SearchInput = (function (_React$Component) {
    _inherits(SearchInput, _React$Component);

    function SearchInput() {
      _classCallCheck(this, SearchInput);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(SearchInput).apply(this, arguments));
    }

    _createClass(SearchInput, [{
      key: 'render',
      value: function render() {
        return React.createElement("input", { type: "search", id: "search", placeholder: "Say something", style: searchInputStyles, onChange: this.props.onChange });
      }
    }]);

    return SearchInput;
  })(React.Component);

  var tagContainerStyles = {
    'width': '100%',
    'height': '40px'
  };

  var tagStyles = {
    'float': 'left',
    'padding': '10px 15px',
    'marginRight': '5px',
    'display': 'inline',
    'border': 'solid 1px #ddd',
    'borderRadius': '5px'
  };

  // http://api.worldweatheronline.com/free/v2/marine.ashx?q=34.373,-119.478&key=8e218b0c1fec5abe6d0296e4ab638&format=json

  var TagRenderer = (function (_React$Component2) {
    _inherits(TagRenderer, _React$Component2);

    function TagRenderer() {
      _classCallCheck(this, TagRenderer);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(TagRenderer).apply(this, arguments));
    }

    _createClass(TagRenderer, [{
      key: 'render',
      value: function render() {
        return React.createElement("div", { id: "tags", style: tagContainerStyles }, this.props.tags.map(function (tag) {
          return React.createElement("div", { className: "tag", style: tagStyles }, React.createElement("h4", null, tag.text), React.createElement("ul", null, React.createElement("li", null, tag.pos.tag), React.createElement("li", null, tag.pos.parent), React.createElement("li", null, tag.pos.name)));
        }));
      }
    }]);

    return TagRenderer;
  })(React.Component);

  var POSTagger = (function (_React$Component3) {
    _inherits(POSTagger, _React$Component3);

    function POSTagger(props) {
      _classCallCheck(this, POSTagger);

      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(POSTagger).call(this, props));

      _this3.state = {
        tags: []
      };
      return _this3;
    }

    _createClass(POSTagger, [{
      key: 'onTextChange',
      value: function onTextChange(e) {
        console.log(e);
        var input = $(e.target).val();
        var tags = [];
        var sentences = nlp.pos(input).sentences;
        sentences.forEach(function (sentence) {
          sentence.tokens.forEach(function (token) {
            tags.push(token);
          });
        });

        this.setState({
          'tags': tags
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return React.createElement("div", null, React.createElement(SearchInput, { onChange: this.onTextChange.bind(this) }), React.createElement(TagRenderer, { tags: this.state.tags }));
      }
    }]);

    return POSTagger;
  })(React.Component);

  var Interpreter = function Interpreter(text) {
    this.text = text.toLowerCase();

    this.process();
  };

  Interpreter.prototype.process = function () {
    if (this.text.indexOf('surf') > -1) {
      $.ajax('/marinedata', {
        type: 'get',
        success: function success(response) {
          console.log(response.data.weather);
          $('#results').text(response.data.weather);
        }
      });
    }
  };

  var SpeechManager = function SpeechManager(options) {
    var self = this;
    this.recognition = this.recognition || new webkitSpeechRecognition();
    this.recognition.continuous = options.continuous || true;
    this.recognition.interimResults = options.interimResults || true;
    this.interim_transcript = '';
    this.final_transcript = '';

    this.recognition.onresult = function (event) {
      console.log(event);
      if (typeof event.results === 'undefined') {
        this.recognition.onend = null;
        this.recognition.stop();
        return;
      }

      for (var i = event.resultIndex; i < event.results.length; ++i) {
        var transcript = event.results[i][0].transcript;
        if (typeof transcript === 'undefined') {
          continue;
        }
        console.log(transcript);

        if (event.results[i].isFinal) {
          this.final_transcript += transcript;
          this.final_transcript = this.final_transcript.replace('undefined', ' ');
          $('#search').val('');
          $("#search").val(this.final_transcript + ' ');

          new Interpreter(this.final_transcript);

          this.final_transcript = '';
          this.interim_transcript = '';
        } else {
          this.interim_transcript += transcript;
          this.interim_transcript = this.interim_transcript.replace('undefined', ' ');
          $('#search').val('');
          $("#search").val(this.interim_transcript + ' ');
        }

        // trigger the 'onChange' event handler that React is listening for
        var customEvent = new Event('input', { bubbles: true });
        document.getElementById('search').dispatchEvent(customEvent);
      }
    };
  };

  SpeechManager.prototype.start = function () {
    this.recognition.start();
  };

  SpeechManager.prototype.stop = function () {
    this.recognition.stop();
  };

  var speechManager = new SpeechManager({});
  speechManager.start();

  ReactDOM.render(React.createElement(POSTagger, null), document.getElementById('table'));
})();

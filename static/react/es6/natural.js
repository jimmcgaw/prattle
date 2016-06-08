'use strict';

(function(){
  var React = require('react');
  var ReactDOM = require('react-dom');

  let searchInputStyles = {
    'height': '25px',
    'width': '600px'
  };

  class SearchInput extends React.Component {
    render(){
      return (
        React.createElement("input", {type: "search", id: "search", placeholder: "Say something", style: searchInputStyles, onChange: this.props.onChange})
      );
    }
  }

  let tagContainerStyles = {
    'width': '100%',
    'height': '40px'
  };

  let tagStyles = {
    'float': 'left',
    'padding': '10px 15px',
    'marginRight': '5px',
    'display': 'inline',
    'border': 'solid 1px #ddd',
    'borderRadius': '5px'
  };

  // http://api.worldweatheronline.com/free/v2/marine.ashx?q=34.373,-119.478&key=8e218b0c1fec5abe6d0296e4ab638&format=json

  class TagRenderer extends React.Component {
    render(){
      return (
        React.createElement("div", {id: "tags", style: tagContainerStyles}, 
            this.props.tags.map(function(tag){
              return (
                React.createElement("div", {className: "tag", style: tagStyles}, 
                  React.createElement("h4", null,  tag.text), 
                  React.createElement("ul", null, 
                    React.createElement("li", null,  tag.pos.tag), 
                    React.createElement("li", null,  tag.pos.parent), 
                    React.createElement("li", null,  tag.pos.name)
                  )
                )
                );
            })
        )
      )
    }
  }

  class POSTagger extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        tags: []
      };
    }

    onTextChange(e){
      console.log(e);
      let input = $(e.target).val();
      let tags = [];
      let sentences = nlp.pos(input).sentences;
      sentences.forEach(function(sentence){
        sentence.tokens.forEach(function(token){
          tags.push(token);
        });
      });

      this.setState({
        'tags': tags
      });
    }

    render(){
      return (
        React.createElement("div", null, 
          React.createElement(SearchInput, {onChange: this.onTextChange.bind(this)}), 
          React.createElement(TagRenderer, {tags: this.state.tags})
        )
      );
    }
  }

  var Interpreter = function(text){
    this.text = text.toLowerCase();

    this.process();
  };

  Interpreter.prototype.process = function() {
    if (this.text.indexOf('surf') > -1){
      $.ajax('/marinedata', {
        type: 'get',
        success: function(response){
          console.log(response.data.weather)
          $('#results').text(response.data.weather);
        }
      })
    }
  };

  var SpeechManager = function(options){
    var self = this;
    this.recognition = this.recognition || new webkitSpeechRecognition();
    this.recognition.continuous = options.continuous || true;
    this.recognition.interimResults = options.interimResults || true;
    this.interim_transcript = '';
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
        console.log(transcript);

        if (event.results[i].isFinal){
          this.final_transcript += transcript;
          this.final_transcript = this.final_transcript.replace('undefined', ' ')
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

  SpeechManager.prototype.start = function() {
    this.recognition.start();
  };

  SpeechManager.prototype.stop = function() {
    this.recognition.stop();
  };

  let speechManager = new SpeechManager({});
  speechManager.start();

  ReactDOM.render(
    React.createElement(POSTagger, null),
    document.getElementById('table')
  );

}());
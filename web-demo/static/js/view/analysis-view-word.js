define(['template/analysis-word-template', 'backbone', 'jquery-ui'], function(analysisWordTemplate, Backbone, slider) {

    var MAX_SENTENCE_LENGTH = 6,
      MAX_HOPS = 3,
      WORD_IMPORTANCE_VECTOR = [0.06061461,  0.04120471,  0.14728905,  0.22691217,  0.04447887, 0.47950059];

    var AnalysisWordView = Backbone.View.extend({
        initialize: function () {
            //this.setElement("#analysis_word_container");
            //this.render();

            this.listenTo(this.model, "change:answer", this._onAnswer);
            this.listenTo(this.model, "change:hop", this._onHop);
        },

        render: function () {
            this.renderContent();

            return this;
        },

        renderContent: function () {
            var template = _.template(analysisWordTemplate[0]),
                self = this;

            this.$el.html(template);

            this.$table = this.$el.find(".table");
            this.$slider = this.$el.find(".hop-slider");

            this.$slider.slider({
              min: 0,
              max: MAX_HOPS - 1,
              change: function (event, ui) {
                self.model.set("hop", ui.value);
              }
            });

            this.renderSentences();
        },

        renderSentences: function () {
            var sentences = this.model.get('story'),
                hop = this.model.get('hop'),
                self = this;

            var probs = this.model.get('memoryProbabilities');

          _.each(sentences, function(val, idx) {
            var words = val.split(' '),
              prob = probs[idx],
              hopProb = prob[hop],
              cellTemplate = analysisWordTemplate[1],
              $row = $('<tr style="background-color:rgba(255, 158, 158, ' + hopProb + ' )"></tr>');

            $row.append(_.template(cellTemplate, {'word': hopProb.toFixed(3), 'weight': 0} ));

            for (var i=0; i<MAX_SENTENCE_LENGTH; i++) {
              var w = '';

              if (i >= words.length)
                w = '';
              else
                w = words[i];

              $row.append(_.template(cellTemplate, {'word': w, 'weight': 1 * WORD_IMPORTANCE_VECTOR[i]} ));
            }

            self.$table.append($row);
          });

        },

        _onHop: function () {
            this.$table.empty();
            this.renderSentences();
        },

        _onAnswer: function () {
            this.$el.empty();
            this.renderContent();
        }
    });

    return AnalysisWordView;
});

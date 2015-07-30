'use strict';

angular.module('angular-medium-editor', [])

  .directive('mediumEditor', function() {

    return {
      require: 'ngModel',
      restrict: 'AE',
      scope: { bindOptions: '=', editable: '=' },
      link: function(scope, iElement, iAttrs, ctrl) {

        angular.element(iElement).addClass('angular-medium-editor');

        // Parse options
        var opts = {},
            placeholder = '';
        var prepOpts = function() {
          if (iAttrs.options) {
            opts = scope.$eval(iAttrs.options);
          }
          var bindOpts = {};
          if (scope.bindOptions !== undefined) {
            bindOpts = scope.bindOptions;
          }
          opts = angular.extend(opts, bindOpts);
        };
        prepOpts();
        placeholder = opts.placeholder;
        scope.$watch('bindOptions', function() {
          // in case options are provided after mediumEditor directive has been compiled and linked (and after $render function executed)
          // we need to re-initialize
          if (ctrl.editor) {
            ctrl.editor.destroy();
          }
          prepOpts();
          // Hide placeholder when the model is not empty
          if (!ctrl.$isEmpty(ctrl.$viewValue)) {
            opts.placeholder = '';
          }
          ctrl.editor = new MediumEditor(iElement, opts);
          if(iAttrs.events){
            var evts = scope.$eval(iAttrs.events);
            for(var i in evts){
            var fn = evts[i];
                ctrl.editor.subscribe(i,scope.$parent[fn]);
            }
          }
        });

        scope.$watch('editable',function(active){
          if(active){
            ctrl.editor.setup();
          } else {
            ctrl.editor.destroy();
          }
        });

        var onChange = function() {

          scope.$apply(function() {

            // If user cleared the whole text, we have to reset the editor because MediumEditor
            // lacks an API method to alter placeholder after initialization
            if (iElement.html() === '<p><br></p>' || iElement.html() === '') {
              opts.placeholder = placeholder;
              var editor = new MediumEditor(iElement, opts);
              if(iAttrs.events){
                var evts = scope.$eval(iAttrs.events);
                for(var i in evts){
                var fn = evts[i];
                    editor.subscribe(i,scope.$parent[fn]);
                }
              }
            }

            ctrl.$setViewValue(iElement.html());
          });
        };

        // view -> model
        iElement.on('blur', onChange);
        iElement.on('input', onChange);

        // model -> view
        ctrl.$render = function() {

          if (!this.editor) {
            // Hide placeholder when the model is not empty
            if (!ctrl.$isEmpty(ctrl.$viewValue)) {
              opts.placeholder = '';
            }

            this.editor = new MediumEditor(iElement, opts);
            if(iAttrs.events){
              var evts = scope.$eval(iAttrs.events);
              for(var i in evts){
              var fn = evts[i];
                  this.editor.subscribe(i,scope.$parent[fn]);
              }
            }
          }

          iElement.html(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
        };

      }
    };

  });

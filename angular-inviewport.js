var instances = 0;
module.exports = angular.module('angular-inviewport', []).directive('inViewport', [function () {

    return {
        restrict: 'A',
        require: '?^inViewportContainer',
        transclude: true,
        link: function ($scope, $element, attributes, controller, $transclude) {
            var bound = false;
            var wasVisible = false;
            var hideAgain = !(attributes.inViewportHide == "false");
            var alreadyShown = false;
            var parentElement = controller ? controller.getElement() : null;
            var unregisterDestroyListener;
            var rootScope = $scope.$root;

            var refresh = function () {
                rootScope.$broadcast('inViewportEvent');
            };
            var unregisterEventListener;
            var bindEvents = function () {
                if(!bound) {
                    unregisterEventListener = $scope.$on('inViewportEvent', function (event) {
                        $scope.$digest();
                    });
                    unregisterDestroyListener = $scope.$on('$destroy', function () {
                        unbindEvents();
                    });
                    if(controller) {
                        controller.registerChild();
                    }
                    if (instances++ === 0) {
                        angular.element(window).bind('scroll ready resize refreshIsDisplayed', refresh);
                    }
                    bound = true;
                }
            };

            var unbindEvents = function () {
                if(bound) {
                    unregisterEventListener();
                    unregisterDestroyListener();
                    if (controller) {
                        controller.unregisterChild();
                    }
                    if (--instances === 0) {
                        angular.element(window).unbind('scroll ready resize refreshIsDisplayed', refresh);
                    }
                    bound = false;
                }
            };

            function isInsideContainer() {
                var elementRect = $element[0].getBoundingClientRect();
                var viewPortRect = parentElement ? parentElement[0].getBoundingClientRect() : {
                    top: 0,
                    bottom: document.documentElement.clientHeight,
                    left: 0,
                    right: document.documentElement.clientWidth
                }
                return !(elementRect.right < viewPortRect.left || elementRect.left > viewPortRect.right || elementRect.bottom < viewPortRect.top || elementRect.top > viewPortRect.bottom);
            };

            var childScope;
            var show =  function (show) {
                if(!(alreadyShown && !hideAgain)) {
                    if (show) {
                        $transclude(function (clone, scope) {
                            $element.empty();
                            $element.append(clone);
                            wasVisible = true;
                            if (!hideAgain) {
                                unbindEvents();
                                unregister();
                            }
                            childScope = scope;
                        });
                    } else {
                        if (childScope) {
                            childScope.$destroy()
                            childScope = null;
                        }
                        $element.empty();
                        wasVisible = false;
                    }
                }
            };
            var unregister = $scope.$watch(isInsideContainer, show);
            bindEvents();
        }
    }
}]).directive('inViewportContainer', function () {
    return {
        restrict: 'A',
        controller: ['$element', function ($element) {
            var childInstances = 0;
            this.getElement = function () {
                return $element;
            };

            var refresh = function () {
                $scope.$broadcast('inViewportEvent');
            };

            this.registerChild = function () {
                if(childInstances++ === 0) {
                    $element.bind('scroll ready resize refreshIsDisplayed', refresh);
                }
                childInstances++;
            };

            this.unregisterChild = function () {
                if(--childInstances === 0) {
                    $element.bind('scroll ready resize refreshIsDisplayed', refresh);
                }
            };
        }]
    };
});

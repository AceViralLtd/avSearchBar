import AvSearchBar from './search';
import { Config } from './config';

(function($: any) {
    $.fn.avSearchBar = function(config) {
        let $original = this;
        this.each(function() {
            let $this = $(this);
            $this.selector = $original.selector;
            new AvSearchBar($this, config);
        });
    };
})(jQuery);

export { AvSearchBar };

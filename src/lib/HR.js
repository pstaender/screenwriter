/* HR.js | https://mburakerman.github.io/hrjs/ | @mburakerman | License: MIT */
/**
  * @param el - The element you want to target.
  * @param options - This is an object that contains the options.
*/

export class HR {
    constructor(el, options = {}) {
        this.el = document.querySelectorAll(el)
        this.options = options
        this.defaultOptions = {
            highlight: null,
            replaceWith: null,
            backgroundColor: 'rgb(255, 222, 112)'
        }
    }

    hr() {
        for (let i = 0; i < this.el.length; i++) {
            if (!this.options?.replaceWith && this.options?.highlight) {
                if (Array.isArray(this.options.highlight)) {
                    for (let m = 0; m < this.options.highlight.length; m++) {
                        this.el[i].innerHTML = this.el[i].innerHTML.replace(new RegExp('(' + this.options.highlight[m] + ')', 'gi'), '<span data-hr>$1</span>')
                    }
                } else {
                    this.el[i].innerHTML = this.el[i].innerHTML.replace(new RegExp('(' + this.options.highlight + ')', 'i'), '<span data-hr>$1</span>')
                }

            }

            if ((this.options?.highlight && this.options.highlight !== null) && (this.options?.replaceWith && this.options.replaceWith !== null)) {
                if (Array.isArray(this.options.highlight) && Array.isArray(this.options.replaceWith)) {
                    for (let n = 0; n < this.options.highlight.length; n++) {
                        if (typeof this.options.replaceWith[n] !== 'undefined') {
                            this.el[i].innerHTML = this.el[i].innerHTML.replace(new RegExp(this.options.highlight[n], 'gi'), '<span data-hr>' + this.options.replaceWith[n] + '</span>')
                        }
                    }
                } else {
                    this.el[i].innerHTML = this.el[i].innerHTML.replace(new RegExp(this.options.highlight, 'gi'), '<span data-hr>' + this.options.replaceWith + '</span>')
                }

            }
        }
    }
}


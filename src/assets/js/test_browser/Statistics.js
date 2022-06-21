/**
 * Show test result
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Show test result
 */
window.JitsiTestBrowser.Statistics = {

    /**
     * Statistics content
     */
    statistics: {},

    /**
     * Add a statistic
     *
     * @param testCase
     * @param data
     */
    addStat: function(testCase, data){
        if (!Object.keys(this.statistics).includes(testCase)){
            this.statistics[testCase] = data;
        }else{
            this.statistics[testCase].push(data);
        }
    },

    /**
     * Export statistics
     */
    export: function(){
        // Prepare file name
        let current = new Date();
        let file = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}_${current.getHours()}-${current.getMinutes()}_test-brower-results.json`;

        // Create fake link to force download
        let fakeLink = document.createElement('a');
        fakeLink.setAttribute('href', "data:application/json," + encodeURIComponent(JSON.stringify(window.JitsiTestBrowser.Statistics.statistics)));
        fakeLink.setAttribute('download', `${file}`);

        document
            .querySelector('body')
            .append(fakeLink);

        fakeLink.addEventListener('click', function(){
            // Remove fake link
            this.remove();
        });

        // Force download
        fakeLink.click();
    },

    /**
     * Clear statistics
     */
    reset: function(){
        this.statistics = {};
    }
}
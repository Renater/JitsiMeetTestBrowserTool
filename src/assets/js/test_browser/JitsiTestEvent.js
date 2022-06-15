/**
 * List of Jitsi tests events
 */
window.JitsiTestEvents = {

    /**
     * Test running event
     */
    run: new Event('run'),


    /**
     * Network stat event
     */
    networkStat: new Event('network_stat'),


    dispatch: function(eventName, data = undefined){
        let event;
        switch (eventName){
            case 'run':
                event = this.run;
                break;

            case 'network_stat':
                event = this.networkStat;
                break;

            default:
                console.error(`Unknwon event: ${event}`)
                return;
        }

        for (const [key, value] of Object.entries(data)) {
            event[key] = value;
        }
        document.dispatchEvent(event);
    }
}
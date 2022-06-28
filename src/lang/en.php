<?php
// General
$lang['home'] = 'Home';
$lang['main_title'] = 'Jitsi Meet test browser tool';
$lang['main_title_expand'] = 'Test your browser compatibility with Jitsi Meet';
$lang['run'] = 'Start';
$lang['run_alone_test'] = 'You can run only this test:';
$lang['test_running'] = 'Test in progress ...';
$lang['stop_on_failures'] = "Stop testing on failures";
$lang['advanced_options'] = 'Advanced options';
$lang['error'] = 'Error';
$lang['rerun_all_tests'] = 'Restart tests';
$lang['rerun_alone_test'] = 'Restart test';
$lang['export_results'] = 'Export results';

/* Test cases */

// Test browser
$lang['browser'] = 'Browser';
$lang['browser_title'] = 'Test of your browser';
$lang['browser_test_success']= 'Your browser is compatible with Jitsi Meet.<br />  For the best user experience always use last sable version of your browser.';
$lang['browser_test_fail']= 'Your browser is not compatible with Jitsi Meet.<br />  Please use one these recommended <a href="https://jitsi.github.io/handbook/docs/user-guide/supported-browsers/" target="_blank">Browsers</a>.';

// Test devices
$lang['devices'] = 'Devices';
$lang['devices_title'] = 'Test access to your devices';
$lang['devices_test_success'] = 'Detected media devices :';
$lang['devices_test_fail']= 'Unable to list your media devices (Audio and Video).';
$lang['devices_audio_input_label']='Audio input:';
$lang['devices_audio_output_label']='Audio output:';
$lang['devices_video_label']='Vidéo input:';

// Test camera
$lang['camera'] = 'Camera';
$lang['camera_title'] = 'Test access to your camera';
$lang['camera_test_success'] = 'Your camera is correctly detected.';
$lang['camera_test_success_default'] = 'The camera used by default is:';

// Test micro
$lang['micro'] = 'Microphone';
$lang['micro_title'] = 'Test access to your microphone';
$lang['micro_test_success'] = 'Your microphone is correctly detected.';
$lang['micro_test_success_default'] = 'The microphone used by default is:';

// Test network
$lang['network'] = 'Network';
$lang['network_title'] = 'Test your network connection';
$lang['network_test_fail']= 'Unable to establish a WebRTC media connection to our test server.<br /> You should be connected on media restricted network.<br />Please ask you local support to check your network filter rules.';

// Test room
$lang['room'] = 'Room';
$lang['room_title'] = 'Test direct access to a test conference';
$lang['room_test_fail']= 'Unable to detect the connection of your echo media stream.<br />Please wait 30 seconds before ending the test room.<br />Please verify that you have check your browser <a href="faq#answer6" target="_blank">permission</a>.<br />Please verify your local network filter rules to our <a href="https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart/#setup-and-configure-your-firewall" target="_blank">media servers</a>. ';;


// Home page
$lang['home_disclaimer'] = 'This tool allows to check the following cases:';
$lang['home_browser'] = 'Browser compatibility';
$lang['home_devices'] = 'Access to your devices';
$lang['home_camera'] = 'Access to your camera video';
$lang['home_micro'] = 'Access to your microphone';
$lang['home_network'] = 'Network connections (WebRTC, TCP, UDP)';
$lang['home_room'] = 'Direct access to a conference test room';

// Network test
$lang['websocket'] = 'WebSocket';
$lang['udp'] = 'UDP';
$lang['tcp'] = 'TCP';
$lang['bitrate'] = 'Bitrate:';
$lang['average_bitrate'] = 'Average:';
$lang['packetlost'] = 'Packet lost:';
$lang['framerate'] = 'Framerate:';
$lang['droppedframes'] = 'Dropped frames:';
$lang['jitter'] = 'Jitter:';

// Buttons
$lang['run_all_tests'] = 'Start testing';

// Results
$lang['results'] = 'Results';
$lang['results_shown_there'] = 'Results of this test will be shown here.';
$lang['all_results_shown_there'] = 'Result of tests will be shown here.';
$lang['global_test_fail'] = 'Some problems occurred while executing tests';
$lang['following_test_failed'] = 'Following test failed:';
$lang['global_more_information'] = 'For more details, you can consult the result of each test.';
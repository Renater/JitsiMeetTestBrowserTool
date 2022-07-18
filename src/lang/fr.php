<?php
// General
$lang['home'] = 'Accueil';
$lang['main_title'] = 'Jitsi Meet test browser tool';
$lang['main_title_expand'] = 'Tester la compatibilité de votre navigateur avec Jitsi Meet';
$lang['run'] = 'Démarrer';
$lang['run_alone_test'] = 'Vous pouvez lancer uniquement ce test :';
$lang['test_running'] = 'Test en cours ...';
$lang['stop_on_failures'] = "Arrêter le test en cas d'erreur";
$lang['advanced_options'] = 'Option avancées';
$lang['error'] = 'Erreur';
$lang['rerun_all_tests'] = 'Relancer les tests';
$lang['rerun_alone_test'] = 'Relancer ce test';
$lang['export_results'] = 'Exporter les résultats';

/* Test cases */

// Test browser
$lang['browser'] = 'Navigateur';
$lang['browser_title'] = 'Test de votre navigateur';
$lang['browser_test_success']= 'Votre navigateur est compatible avec Jitsi Meet.<br /> Pour bénéficier d\'une meilleure expérience utilisateur nous vous recommandons de toujours utiliser les dernières versions stables des navigateurs.';
$lang['browser_test_fail']= 'Votre navigateur n\'est pas compatible avec Jitsi Meet.<br /> Veuillez utiliser l\'un des navigateurs suivant : <a href="https://jitsi.github.io/handbook/docs/user-guide/supported-browsers/" target="_blank">Navigateurs</a>.';

// Test devices
$lang['devices'] = 'Périphériques';
$lang['devices_title'] = 'Test de l\'accès à vos périphériques';
$lang['devices_test_success'] = 'Périphériques média détéctés :';
$lang['devices_test_fail'] = 'Impossible de lister vos périphériques de capture de média (Audio et Vidéo).';
$lang['devices_audio_input_label']='Capture Audio :';
$lang['devices_audio_output_label']='Sortie Audio :';
$lang['devices_video_label']='Capture Vidéo :';

// Test camera
$lang['camera'] = 'Caméra';
$lang['camera_title'] = 'Test de l\'accès à votre caméra';
$lang['camera_test_success'] = 'Votre caméra est correctement détectée.';
$lang['camera_test_success_default'] = 'La caméra utilisée par défaut est :';

// Test micro
$lang['micro'] = 'Microphone';
$lang['micro_title'] = 'Test de l\'accès à votre microphone';
$lang['micro_test_success'] = 'Votre microphone est correctement détecté.';
$lang['micro_test_success_default'] = 'Le microphone utilisé par défaut est :';

// Test network
$lang['network'] = 'Réseau';
$lang['network_title'] = 'Test de votre connexion réseau';
$lang['network_test_fail'] = 'Impossible de réaliser une connexion média WebRCT vers notre serveur de test.<br />Vous devez vous trouver dans un environnement ou la trafic WebRTC est filtré.<br />Veuillez vérifier auprès de vos responsable informatiques locaux les règles de filtrages des connexions';

// Test room
$lang['room'] = 'Conférence';
$lang['room_title'] = 'Test de l\'accès direct à une conference de test';
$lang['room_test_fail'] = 'Impossible de detecter la connection votre flux média.<br />Veuillez attendre au moins 30 secondes avant d\'arrêter le test.<br />Veuillez vérifier vos <a href="faq#answer6" target="_blank">permissions de navigateur</a>.<br />Veuillez vérifier vos règles de filtrages réseaux vers <a href="https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart/#setup-and-configure-your-firewall" target="_blank">nos media servers</a>.';
$lang['room_test_success']= 'Votre flux média a bien été connecté.';

// Home page
$lang['home_disclaimer'] = 'Cet outil vous permet de vérifier les cas suivant:';
$lang['home_browser'] = 'Compatibilité de votre navigateur';
$lang['home_devices'] = 'Accès à vos périphériques';
$lang['home_camera'] = 'Accès à votre caméra';
$lang['home_micro'] = 'Accès à votre microphone';
$lang['home_network'] = 'Connexions réseaux (WebRTC, TCP, UDP)';
$lang['home_room'] = 'Accès direct à une conférence de test';

// Network test
$lang['websocket'] = 'WebSocket';
$lang['udp'] = 'UDP';
$lang['tcp'] = 'TCP';
$lang['bitrate'] = 'Bitrate :';
$lang['average_bitrate'] = 'Average:';
$lang['packetlost'] = 'Packetlost :';
$lang['framerate'] = 'Framerate :';
$lang['droppedframes'] = 'Dropped frames :';
$lang['jitter'] = 'Jitter :';

// Buttons
$lang['run_all_tests'] = 'Démarrer le test';

// Results
$lang['results'] = 'Résultats';
$lang['results_shown_there'] = 'Les résultats de ce test s\'afficheront ici.';
$lang['all_results_shown_there'] = 'Le résultat des tests s\'affichera ici.';
$lang['global_test_fail'] = 'Des problèmes sont survenus lors de l\'exécution des tests';
$lang['following_test_failed'] = 'Les tests suivant n\'ont pas été réussi :';
$lang['global_more_information'] = 'Pour plus de détails, vous pouvez consulter le résultat de chaque test.';

$lang['global_test_success'] = 'Votre poste de travail est compatible avec notre service';
$lang['global_test_message'] = 'Vous pouvez pleinement utiliser le services RendezVous.<br /><br />Si vous le souhaitez, vous pouvez exporter les résultats ou relancer les tests en utilisant les boutons ci-dessous.';

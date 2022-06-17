<?php

use MatthiasMullie\Minify;

define('APP_ROOT', dirname(__FILE__).'/../');

include APP_ROOT.'vendor/autoload.php';

$options = getopt('hqyv', ['help', 'release:', "turn-endpoint:", "websocket-url:", "application-url:", 'fontawesome-kit:', 'lang:']);

if (array_key_exists('h', $options) || array_key_exists('help', $options)) {
    echo "\n" . 'Make a release for Jitsi test browser page (minify js/css files, pack the app in one file).' . "\n";
    echo "\t\n";
    echo 'Usage :' . "\n";
    echo "\t" . ' php make-release.php [-h|--help] [-v] --release:release_name [--turn-endpoint] [--websocket-url] [--application-url]' . "\n";
    echo "\t\n";
    echo "\t> Mandatory options";
    echo "\t\n";
    echo "\t" . ' --release : the wanted release name' . "\n";
    echo "\t" . ' --debug : exec the script debugging purpose' . "\n";
    echo "\t" . ' -h / --help : print this help' . "\n";
    echo "\t" . ' -q : quiet mode' . "\n";
    echo "\t" . ' -v : verbose mode' . "\n";
    echo "\t" . ' -y  : Force answer "yes" to messages prompted' . "\n";
    echo "\t\n";
    echo "\t> Optional options";
    echo "\t\n";
    echo "\t" . ' --fontawesome-kit : Font Awesome kit URL.' . "\n";
    echo "\t" . ' --lang : the wanted lang code. Default is "en".' . "\n";
    echo "\t" . ' --turn-endpoint : specify the turn endpoint to use for testing. Default is "https://rendez-vous.renater.fr/home/rest.php/TurnServer"' . "\n";
    echo "\t" . ' --websocket-url : specify the web socket url to use for testing. Default is "wss://rendez-vous.renater.fr/colibri-ws/echo"' . "\n";
    echo "\t" . ' --application-url : specify the application url to use for testing room. Default is "https://rendez-vous.renater.fr/"' . "\n";
    
    echo "\n";
    exit;
}


class MakeRelease{
    
    /**
     * @var string Turn endpoint to use
     */
    private static string $turnEndpoint = 'https://rendez-vous.renater.fr/home/rest.php/TurnServer';
    
    /**
     * @var string Websocket URL to use
     */
    private static string $websocketUrl = 'wss://rendez-vous.renater.fr/colibri-ws/echo';
    
    /**
     * @var string Application URL to use
     */
    private static string $applicationUrl = 'https://rendez-vous.renater.fr/';
    
    /**
     * @var string Application URL to use
     */
    private static string $fontawesomeKitURL = 'https://kit.fontawesome.com/0d01ffef9c.js';
    
    /**
     * @var string Lang to use on the generated page
     */
    private static string $lang = 'en';
    
    /**
     * @var bool Quiet mod
     */
    public static bool $quiet = false;
    
    /**
     * @var bool Verbose mod
     */
    public static bool $verbose = false;
    
    /**
     * @var string $release
     */
    public static string $release = '';
    
    
    /**
     * @var bool Force yes to prompted questions
     */
    private static bool $forceYes = false;
    
    
    /**
     * EkkoLayer constructor.
     *
     * @param $options Array got from CLI
     */
    public function __construct(array $options) {
        // Prepare quiet & verbose mod
        static::$quiet = array_key_exists('q', $options);
        static::$forceYes = array_key_exists('y', $options);
        static::$verbose = !static::$quiet && array_key_exists('v', $options);
        
        if (array_key_exists('release', $options)){
            static::$release = $options['release'];
        }else{
            MakeRelease::error('Parameter --release not set');
        }
        
        if (array_key_exists('turn-endpoint', $options)){
            static::$turnEndpoint = $options['turn-endpoint'];
        }
        if (array_key_exists('websocket-url', $options)){
            static::$websocketUrl = $options['websocket-url'];
        }
        if (array_key_exists('application-url', $options)){
            static::$applicationUrl = $options['application-url'];
        }
        if (array_key_exists('fontawesome-kit', $options)){
            static::$fontawesomeKitURL = $options['fontawesome-kit'];
        }
        if (array_key_exists('lang', $options)){
            if (!file_exists(APP_ROOT.'src/lang/'.$options['lang'].'.php'))
                static::error("Lang '".$options['lang']."' not found");
            
            static::$lang = $options['lang'];
        }
    }
    
    
    /**
     * @return void
     * @throws Minify\Exceptions\IOException
     */
    public function process(){
        $target = realpath(APP_ROOT.'/gen/').'/'.static::$release;
        $sources = realpath(APP_ROOT.'/src/');
        
        $continue = true;
        
        // Create target folder
        static::verbose("> Create target folder [".$target."] ...");
        if (is_dir($target)){
            $input = static::$forceYes ? 'y' :  static::prompt("[Warning] Target folder already exists. All content will be erased. Continue? [y]");
            if (in_array($input, ['y', 'Y', 'yes', 'YES', ""])) {
                // remove old layer files
                if (is_dir($target)){
                    static::deleteDir($target);
                    static::verbose("\t=> Folder [".$target."] deleted.\n");
                }
            }else{
                $continue = false;
                static::message('Operation canceled by user.');
            }
        }
        
        if ($continue){
            // Create target folder
            mkdir($target, 0755);
            
            // Minify sources found
            $minified = static::minify($sources);
            
            $cssContent = '<style>' . $minified['css'] . '</style>';
            $jsContent = '<script type="text/javascript">' . $minified['js'] . '</script>';
            
            // Copy template
            $targetIndex = $target.'/index.html';
            if (copy(APP_ROOT.'/src/index.html', $targetIndex)){
                
                // Replace in file
                $str = file_get_contents($targetIndex);
                $str = str_replace('<!--JS_FILES-->', $jsContent, $str);
                $str = str_replace('<!--CSS_FILES-->', $cssContent, $str);
                $str = str_replace('<!--turn_endpoint-->', static::$turnEndpoint, $str);
                $str = str_replace('<!--websocket_url-->', static::$websocketUrl, $str);
                $str = str_replace('<!--application_url-->', static::$applicationUrl, $str);
                $str = str_replace('<!--FONTAWESOME_KIT-->', static::$fontawesomeKitURL, $str);
                
                // Set up lang translation
                $str  = $this->applyTranslation($str);
                
                // Put content into index target html file
                file_put_contents($targetIndex, $str);
                
                static::message("File $targetIndex successfully created.");
            }else{
                static::error('Cannot copy template file');
            }
        }
    }
    
    /**
     * Apply asked translation
     *
     * @param $str
     * @return array|mixed|string|string[]
     */
    private function applyTranslation($str){
        $lang = [];
        
        include APP_ROOT.'/src/lang/'.static::$lang.'.php';
    
        foreach($lang as $id => $tr){
            $str = str_replace('{tr:'.$id.'}', utf8_decode($tr), $str);
        }
    
        return str_replace('"<!--DICTIONARY_CONTENT-->"', utf8_decode(json_encode($lang)), $str);
    }
    
    
    /**
     * Minify JS & CSS files
     *
     * @param $source
     *
     * @return array
     *
     * @throws Minify\Exceptions\IOException
     */
    private static function minify($source): array {
        $minifierCSS = new MatthiasMullie\Minify\CSS();
        $minifierJS = new MatthiasMullie\Minify\JS();
    
        $files = static::getFiles($source);
        foreach ($files as $file) {
            $info = pathinfo($file);
        
            if (array_key_exists('extension', $info)) {
                if ($info['extension'] === 'css') {
                    $minifierCSS->addFile($file);
                } else if ($info['extension'] === 'js') {
                    $minifierJS->addFile($file);
                }
            }
        }
    
        return [
            'js' => $minifierJS->minify(),
            'css' => $minifierCSS->minify()
        ];
    }
    
    /**
     * Get files in dir
     *
     * @param $source
     *
     * @return array
     */
    static function getFiles($source): array {
        $files = array( );
        if (is_dir($source) & is_readable($source)) {
            $dir = dir($source);
            while (false !== ($file = $dir->read( ))) {
                // skip . and ..
                if (('.' === $file) || ('..' === $file) || ('debug' === $file)) {
                    continue;
                }
            if (is_dir("$source/$file")) {
                $files = array_merge($files, static::getFiles("$source/$file"));
            } else {
                $files[] = "$source/$file";
            }
        }
            $dir->close( );
        }
        return $files;
    }
    
    
    
    /**
     * Prompt message and return user answer
     *
     * @param string $message
     * @return string
     */
    public static function prompt(string $message = ''): string {
        echo $message;
        $handle = fopen("php://stdin", 'r');
        $line = fgets($handle);
        return trim($line);
    }
    
    
    /**
     * Delete directory
     *
     * @param $dirPath
     */
    function deleteDir($dirPath) {
        if (! is_dir($dirPath)) {
            echo "$dirPath must be a directory";
            die(1);
        }
        if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
            $dirPath .= '/';
        }
        $pattern = $dirPath . '{,.}[!.,!..]*';
        $files = glob($pattern, GLOB_MARK|GLOB_BRACE);
        foreach ($files as $file) {
            if (is_dir($file)) {
                static::deleteDir($file);
            } else {
                unlink($file);
            }
        }
        rmdir($dirPath);
    }
    
    /**
     * Show message in CLI
     *
     * @param $message
     */
    public static function message($message){
        if (static::$quiet) return;
        
        echo $message . "\n";
    }
    
    
    /**
     * Verbose message to show in CLI
     *
     * @param $message
     */
    public static function verbose($message){
        if (!static::$verbose) return;
        
        static::message($message);
    }
    
    /**
     * Show message then die
     *
     * @param $message string Message to show
     */
    public static function error(string $message){
        die('[ERROR] ' . $message . ', exiting' . "\n");
    }
}

// Make new release
try{
    $makeRelease = new MakeRelease($options);
    $makeRelease->process();
    
}catch (Exception $e){
    die ("[ERROR] ".$e->getMessage()."\n");
}




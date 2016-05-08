@echo off

java -jar ../../../closure-compiler-hg/build/compiler.jar ^
    --compilation_level ADVANCED_OPTIMIZATIONS ^
    --jscomp_off fileoverviewTags ^
    --define goog.DEBUG=false ^
    --process_closure_primitives ^
    --js ../../closure/goog/base.js ^
    --js bigint.js ^
    --js barrett.js ^
    --js rsa_.js ^
    --output_wrapper="(function(){%%output%%})();" ^
    --js_output_file=rsa.js
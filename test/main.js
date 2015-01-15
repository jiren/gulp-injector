var gutil = require("gulp-util"),
    should = require("should"),
    inject = require("../index"),
    fs = require("fs"),
    vm = require("vm");


describe("gulp-injector", function () {

  describe("inject comment and file ext matching", function () {
    exports = {};
    include_module = {
      require: require,
      console: console,
      exports: exports,
      module: {
        exports: exports
      }
    }
    
    vm.runInNewContext(fs.readFileSync('index.js'), include_module)

    beforeEach(function (done) {
      include_module.INJECT_REGEX.lastIndex = 0;
      include_module.JS_FILE_REGX.lastIndex = 0;
      done()
    })

    it("match inject js comment", function () {
      comment = "/* inject my_module.js */";
      matches = include_module.INJECT_REGEX.exec(comment)

      should.exist(matches)

      matches[0].should.eql(comment)
      matches[1].trim().should.eql('my_module.js')
    })

    it("match js file ", function () {
      file  = "my_module.js";
      isJsFile = file.match(include_module.JS_FILE_REGX)

      should(isJsFile).be.ok
    })

  })

  describe("File replacing", function () {
     it("replace inject comments with file contents", function (done) {
        var file = new gutil.File({
          base: "test/fixtures/",
          path: "test/fixtures/app.js",
          contents: fs.readFileSync("test/fixtures/app.js")
         });

        testInject = inject();
        testInject.on("data", function (newFile) {
          should.exist(newFile);
          should.exist(newFile.contents);

          String(newFile.contents).should.equal(String(fs.readFileSync("test/expected/app_dist.js"), "utf8"))
          done();
        });
        testInject.write(file);
     });
  });

});

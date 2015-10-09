module.exports = {
  chdir: function(dir) {
    process.chdir(dir);
  },
  cwd: function() {
    return process.cwd();
  },
  commandPrompt: function() {
    return this.cwd() + ">";
  }
};

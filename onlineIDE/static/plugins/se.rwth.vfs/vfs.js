define(function(require, exports, module) {
	"use strict";
	var username = localStorage.getItem("username");
	var reponame = localStorage.getItem("reponame");
	var branchname = localStorage.getItem("branchname");
	var mountPoint = username + '/' + reponame + '/' + branchname;
	
	return VFS(mountPoint);
});
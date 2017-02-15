#!/usr/bin/env node
// jshint asi: true
// jshint esversion: 6

const http = require("http")
const fs = require("fs")
const path = require("path")
const os = require("os")
const url = require("url")
const readline = require("readline")
const ws = require("uws")
const determine_mime_type = require("determine-mime-type")

function WebSocketServer (ip, port) {
	const server = new ws.Server({ port: port, host: ip})
	server.on("connection", on_connection)
	console.log("websocket listening to", ip + ":" + port)
	Readline(function () { broadcast("big memes") })

	function on_connection (socket) {
		console.log(socket._socket.remoteAddress, "connected")
		socket.on("message", on_message) }

	function on_message (message) { this.close() }

	function broadcast (what) {
		server.clients.forEach(client => {
			client.send(what) })}}

function Serve (root, ip, port) {
	const server = http.createServer(request_listener)
	server.listen(port, ip)
	console.log("Listening on", ip + ":" + port)

	function something_went_wrong (res) {
		res.statusCode = 400
		res.setHeader("Content-Type", "text/plain")
		res.end("Something went wrong") }

	function send_file (pathname, res) {
		const stream = fs.createReadStream(pathname)
		stream.on("open", () => {
			res.statusCode = 200
			res.setHeader("Content-Type", determine_mime_type(pathname))
			stream.pipe(res) })
		stream.on("error", () => { something_went_wrong (res) }) }

	function request_listener(req, res) {
		const u = url.parse(req.url)
		const p = u.pathname === "/" ? path.join(root, "index.html") : path.join(root, u.pathname)
		file_ok_p(p, (flag) => {
			if (flag) send_file(p, res)
			else something_went_wrong(res) }) }
	
	function file_ok_p (pathname, cb) {
		fs.stat(pathname, (err, stats) => {
			if (err) cb(false)
			else if (stats.isFile()) cb(true)
			else cb(false) }) } }

function Readline (cb) {
	const rl = readline.createInterface({
		input: process.stdin, output: process.stdout})
	console.log("'go' to countdown, 'quit' to quit")
	ask()
	function ask () { rl.question("> ", answer_listener) }
	function answer_listener (answer) {
		switch(answer) {
			case "go":
				cb()
				break
			case "quit":
				rl.close()
				process.exit(0)
				break }
		ask() }}

function main() {
	const ip = process.argv[2] ? process.argv[2] : "0.0.0.0"
	Serve("./", ip, 8000)
	WebSocketServer(ip, 8001) }

main()

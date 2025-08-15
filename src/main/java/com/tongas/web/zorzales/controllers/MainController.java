package com.tongas.web.zorzales.controllers;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestMapping;


@RestController
public class MainController {
	private long counter = 0;

	@RequestMapping("/touch")
	public String touch() {
		++this.counter;
		return "";
	}

	@RequestMapping("/total")
	public String total(){
		return String.format("Total: %d", this.counter);
	}
}

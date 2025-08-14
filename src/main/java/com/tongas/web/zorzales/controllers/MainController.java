package com.tongas.web.zorzales.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
public class MainController {
    
	@RequestMapping("/newgame")
	public String newGame() {

		return "OK";
	}

}

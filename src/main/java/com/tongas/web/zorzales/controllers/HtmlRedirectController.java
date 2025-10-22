package com.tongas.web.zorzales.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class HtmlRedirectController {

    @RequestMapping(value = "/page/{path:^(?!.*\\.html$).*$}")
    public RedirectView redirectToHtml(@PathVariable String path) {
        return new RedirectView("/page/" + path + ".html");
    }
}


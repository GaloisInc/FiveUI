package com.galois.fiveui;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.googlecode.jatl.Html;

public class Reporter {
	
	private String summaryString, byURLString, byRuleString;
	
	public Reporter(List<Result> results) {
		StringWriter summaryPage, byURLPage, byRulePage;
		final Map<String, List<String>> byURLMap;
		final Map<String, List<String>> byRuleMap;
		byURLMap = sortByURL(results);
		byRuleMap = sortByRule(results);
		
		// Build the summary page
		summaryPage = new StringWriter();
		new Html(summaryPage) {{
			bind("foo", "bar");
				html();
					body();
					h1().text("Headless Run Summary").end();
					p();
						ul();
						li().a().href("byurl.html").text("by URL").end().end();
						li().a().href("byrule.html").text("by Rule").end().end();
						end();
					end();
					p();
						div().id("stats-box");
							text("stats here");
						end();
					end();
					endAll();
				done();
		}};
		this.summaryString = summaryPage.getBuffer().toString();
		
		// Build the "by URL" page
		byURLPage = new StringWriter();
		new Html(byURLPage) {{
			html();
				body();
				h1().text("Results by URL").end();
				ol();
					for (String url: byURLMap.keySet()) {
						li().h2().a().href(url).text(url).end().end();
							ul();
								for (String entry: byURLMap.get(url)) {
									li().text(entry).end();
								}
							end();
						end();
					}
				endAll();
			done();
		}};
		this.byURLString = byURLPage.getBuffer().toString();
		
		// Build the "by Rule" page
		byRulePage = new StringWriter();
		new Html(byRulePage) {{
			html();
				body();
				h1().text("Results by Rule").end();
				ol();
					for (String rule: byRuleMap.keySet()) {
						li().h2().text(rule).end();
							ul();
								for (String url: byRuleMap.get(rule)) {
									li().text("URL: ").a().href(url).text(url).end().end();
								}
							end();
						end();
					}
				endAll();
			done();
		}};
		this.byRuleString = byRulePage.getBuffer().toString();
	}
	
	public String getSummary() {
		return summaryString;
	}
	
	public String getByURL() {
		return byURLString;
	}
	
	public String getByRule() {
		return byRuleString;
	}
	
	private Map<String, List<String>>sortByURL(List<Result> results) {
		Map<String, List<String>> map = new HashMap<String, List<String>>();
		String url, rule;
		List<String> list;
		ResType type;
		for (Result r: results) {
			url = r.getURL();
			rule = r.getRuleName();
			type = r.getType();
			if (map.containsKey(url)) {
				list = map.get(url);
				list.add(type.toString() + ": " + rule);
			} else {
				list = new ArrayList<String>();
				list.add(type.toString() + ": " + rule);
				map.put(url, list);
			}
		}
		return map;
	}
	
	private Map<String, List<String>>sortByRule(List<Result> results) {
		Map<String, List<String>> map = new HashMap<String, List<String>>();
		String url, rule;
		List<String> list;
		for (Result r: results) {
			url = r.getURL();
			rule = r.getRuleName();
			if (map.containsKey(rule)) {
				list = map.get(rule);
				list.add(url);
			} else {
				list = new ArrayList<String>();
				list.add(url);
				map.put(rule, list);
			}
		}
		return map;
	}
	
}

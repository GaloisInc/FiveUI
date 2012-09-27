/**
 * Module     : FileServer.java
 * Copyright  : (c) 2011-2012, Galois, Inc.
 *
 * Maintainer :
 * Stability  : Provisional
 * Portability: Portable
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.galois.fiveui.testrunner;

import org.mortbay.jetty.Handler;
import org.mortbay.jetty.Server;
import org.mortbay.jetty.handler.DefaultHandler;
import org.mortbay.jetty.handler.HandlerList;
import org.mortbay.jetty.handler.ResourceHandler;
import org.mortbay.jetty.nio.SelectChannelConnector;

/**
 * Very basic http file server
  */
public class FileServer {
	private final String _root;
	private Server _server;

	public static void main(String[] args) throws Exception {
		final FileServer server = new FileServer(".");

		Thread.sleep(60 * 1000);
		server.stop();
	}

	public void stop() throws Exception {
		_server.stop();
	}

	/**
	 * 
	 * @param root The root directory to serve files from.
	 */
	public FileServer(String root) {
		_root = root;
	}
	
	/**
	 * Start serving http reuqests asynchronously. 
	 * 
	 * @throws Exception 
	 */
	public void start() {
		Runnable runner = new Runnable() {
			public void run() {
				try {
					FileServer.this.runServer();
				} catch (Exception e) {
					System.err.println("Exception starting server:");
					e.printStackTrace();
				}
			}
		};
		
		runner.run();
	}
	
	private void runServer() throws Exception {
		_server = new Server();
		SelectChannelConnector connector = new SelectChannelConnector();
		connector.setPort(getPort());
		_server.addConnector(connector);

		ResourceHandler resource_handler = new ResourceHandler();
		// resource_handler.setDirectoriesListed(true);
		resource_handler.setWelcomeFiles(new String[] { "index.html" });

		resource_handler.setResourceBase(_root);

		HandlerList handlers = new HandlerList();
		handlers.setHandlers(new Handler[] { resource_handler,
				new DefaultHandler() });
		_server.setHandler(handlers);

		_server.start();
	}

	public int getPort() {
		return 8080;
	}
}

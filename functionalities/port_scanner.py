import socket
import ipaddress
import errno
import subprocess

services = {
    20: "FTP Data",
    21: "FTP Control",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    3306: "MySQL",
    3389: "RDP"
}

def scan_ports(target_ip, start_port, end_port):
    for port in range(start_port, end_port + 1):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM) 
        try:
            sock.settimeout(1.0) # for firewalled ips
            result = sock.connect_ex((target_ip, port)) 
            if result == 0:
                service_name = services.get(port, "Unknown") # will get service name running on the port
                print(f"Port {port} is OPEN — Service: {service_name}")
            elif result == errno.ETIMEDOUT:
                print(f"Port {port}: Connection TIMED OUT")
        finally:
            sock.close()

while True:
    target_ip = input("Enter the URL or IP address: ")
    try:
        ip = socket.gethostbyname(target_ip)  # Resolves domain to IP
        ip_add = ipaddress.ip_address(ip)     # Validates IP
        scan_ports(ip, 20,1024)  # Scan limited range for testing
        break
    except ValueError:
        print("You entered an invalid IP address.")
    except socket.gaierror:
        print("Hostname could not be resolved.")

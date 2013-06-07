'''
Created on Apr 19, 2013

@author: semion
'''
from datetime import datetime
from optparse import OptionParser
import ftplib
import os


def get_remote_date(connection, filename):
    modifiedTime = connection.sendcmd('MDTM ' + filename)
    # successful response: '213 20120222090254'
    try:
        dt = datetime.strptime(modifiedTime[4:], "%Y%m%d%H%M%S")
    except:
        dt = None
    return dt


def get_local_date(gtfs_dir, filename):
    file_path = os.path.join(gtfs_dir, filename)
    if not os.path.exists(file_path):
        return None
    
    modified_time = os.path.getmtime(file_path)
    return datetime.fromtimestamp(modified_time)


def fetch_gtfs_file(connection, gtfs_dir, filename):
    file_path = os.path.join(gtfs_dir, filename)
    connection.retrbinary('RETR %s' % filename, open(file_path, 'wb').write)
    
    
def update(connection, filename, path):
    pass


if __name__ == '__main__':
    p = OptionParser(usage="usage: %prog [options]")
    p.add_option("-d", "--dir", metavar="DIR", dest="gtfs_dir",
                 help="Absolute path to the directory containing the GTFS files", default="GTFS")
    p.add_option("-f", "--file", metavar="FILE", dest="filename",
                 help="Name of the GTFS zip file on the server", default="gtfs.zip")
    p.add_option("-u", "--url", metavar="URL", dest="ftp_server",
                 help="Address of the ftp server to fetch from", default="ftp://localhost/")
    
    options, args = p.parse_args()
    
    ftpCredentials = {'host' : options.ftp_server,}
    
    connection = ftplib.FTP(**ftpCredentials)
    

#!/usr/bin/env python

import subprocess, random, sys
import time
import logging
import yaml
import argparse

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')

def fsm_random_step(fsm, cur_state):
    possible_actions = fsm[cur_state]
    action = random.choice(possible_actions.keys())
    next_state = possible_actions[action]
    return action, next_state

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('proxy', nargs='?')
    args = parser.parse_args(sys.argv[5:])

    if (len(sys.argv) < 5):
        logging.error("Usage: driver.py fsm_file.yml app-folder username password")
        sys.exit(1)
    fsm = yaml.load(open(sys.argv[1],'r').read())
    folder = sys.argv[2]
    if len(folder) != 0:
        if folder[-1] != '/':
            folder += '/'
    username = sys.argv[3]
    passw = sys.argv[4]
    history_file = open('hist.txt', 'w')
    casper_log = open('casp.txt', 'w')
    cur_state = 'UNAUTH_HOME'
    total_steps = 500
    history_file.write(str(total_steps)+'\n')
    if args.proxy:
        print "using proxy: %s" % args.proxy[6:]
        casper_process = subprocess.Popen(['casperjs', '--' + str(args.proxy), 'main.js'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=folder)
    else:
        casper_process = subprocess.Popen(['casperjs', 'main.js'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=folder)
    for i in range(total_steps + 1):
        if i == total_steps:
            logging.info('Last step')
            action = 'STOP'
        else:
            action, cur_state = fsm_random_step(fsm, cur_state)
            action = action.format(username=username, password=passw)
            history_file.write(action+'\n')
        while True:
            if casper_process.poll() is not None:
                raise Exception('Casper exited early!')
            casper_output = casper_process.stdout.readline()[:-1]
            if '[warning]' in casper_output:
                logging.warn("CASPER: " + casper_output)
            elif '[error]' in casper_output or 'CasperError' in casper_output:
                logging.error("CASPER: " + casper_output)
            else:
                logging.debug("CASPER: " + casper_output)
            casper_log.write(casper_output+'\n')
            if casper_output == 'Type command: ':
                logging.info("STEP %d of %d : %s"%(i+1, total_steps+1, action))
                casper_process.stdin.write(action+'\n')
                break
    history_file.close()
    casper_log.close()
    casper_process.wait()
    return 0

if __name__ == '__main__':
    main()


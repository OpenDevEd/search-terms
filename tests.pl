#!/usr/bin/perl
use strict;
use warnings;
use feature 'say';

my @tools = ("openalex-cli", "scopus-cli", "scite-cli", "scholarly-cli");
my @options = (
	'--count',
	'--chunkSize 100 --limit 100' 
);
# Add more tests...

foreach my $option (@options) {
    say "=============== Testing $option ====================================";
    foreach my $tool (@tools) {
        say "------------------------ $tool -----------------------------------------------------";
        my $command = "$tool search $option EdTech OR 'educational technology' OR 'education technology'";
        system($command);
    }
}

#!/usr/bin/perl
use warnings; use strict; use utf8;
use open IO => ':encoding(UTF-8)', ':std';
use feature qw{ say signatures }; no warnings qw{ experimental::signatures };
# use experimental 'smartmatch'; use experimental qw(declared_refs);
# use 5.34.0; use experimental qw{ try }; no warnings { experimental::try };
use File::Slurper qw(read_text read_lines write_text);
my $home = $ENV{HOME};
chomp(my $date = `date +'%Y-%m-%d_%H.%M.%S'`);
chomp(my $iso = `date --iso=seconds`);
my $hasargs = $#ARGV;
my $help = "";
my $string = "";
my $number = "";
use Getopt::Long;
GetOptions (
    "string=s" => \$string, 
    "help" => \$help, 
    "number=f" => \$number, 
    ) or die("Error in command line arguments\n");

&main();

sub main() {
    while (<DATA>) {
	s/\n//;
	my $terms = `search-terms-expander $_`;
	my $file = $_;
	$file =~ s/\W/_/sg;
	$terms =~ s/\n//;
	#say $terms;
	my $filex = "GS_short2-$file.json";
	if (-e $filex || -e "$filex.json" || -e "$filex.json.gz") {
	    say "File variant exists: $filex";
	    next;
	};
	system "scholarly-cli --search '$terms' --limit 1000 --year_low 2011 --year_high 2025 --save $filex";
	system "gzip $filex.json";
    };
};


__DATA__
"adaptive learning" AND GS_educationV1...
"digital learning" AND GS_educationV1...
"digital technology" AND GS_educationV1...
EdTech AND GS_educationV1...
"educational technolog" AND GS_educationV1...
"game-based learning" AND GS_educationV1...
gamification AND GS_educationV1...
"mobile app" AND GS_educationV1...
"mobile learning" AND GS_educationV1...
"online learning" AND GS_educationV1...
"elearning" AND GS_educationV1...
"artificial intelligence" AND GS_educationV1...

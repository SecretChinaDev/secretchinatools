/* This is a JavaScript module (JSM) to be imported via Components.utils.import() and acts as a singleton.
   Only the following listed symbols will exposed on import, and only when and where imported. */
const EXPORTED_SYMBOLS = ["ipdb"];

/*
    The IP address location database files are in the format:
        [range start integer 1][range start integer 2]...  [2 byte country code 1][2 byte country code 2]...

    For IPv4 the full 32-bit address is used. For IPv6 the 48-bit prefix of the 128-bit address is used. (cannot use full 64-bit prefix due to JS limitations)
    Each integer is big-endian binary packed -> 4 bytes for full IPv4 address, 6 bytes for IPv6 address prefix
    Each file is the concatenation of the complete ordered list of start IPs/prefixes with the corresponding list of country codes.
    All IPs/prefixes must be included with unknown/unallocated ranges listed as code "??"
*/

var IPv4DB = { type : "IPv4", bytesPerInt : 4 };
var IPv6DB = { type : "IPv6", bytesPerInt : 6 };

var ipdb =
{
    init : function(IPv4file,IPv6file,IPDBmetadatafile)
    {
        Components.utils.import(IPDBmetadatafile);
        if (!IPDBmetadata)
            throw "IPDB metadata file failed to load";

        loadIPDBfile(IPv4DB,IPv4file);
        loadIPDBfile(IPv6DB,IPv6file);
    },

    close : function()
    {
        closeIPDBfile(IPv4DB);
        closeIPDBfile(IPv6DB);
    },

    get version()  // Generates an IPDB version/date string in the form of YYYY-M
    {
        if (!IPDBmetadata || !IPDBmetadata.created)
            return "ERROR";
        var date = new Date(IPDBmetadata.created);
        return date.getUTCFullYear() + "-" + (date.getUTCMonth()+1);  // JS months are 0-11, just to be confusing
    },

    get daysOld()
    {
        if (!IPDBmetadata || !IPDBmetadata.created)
            return Infinity;
        return (Date.now() - IPDBmetadata.created) / 86400000;
    },

    generateQuickHash : function()  // Generates a quick 6 character alphanumeric hash ID from the IPv4 DB file
    {
        const pointCount = 4;
        const hopLength = Math.floor(6*IPv4DB.entryCount/pointCount)-32;
        var int32hash = 0xFFFFFFFF;
        for (var i=0; i<pointCount; i++)
        {
            IPv4DB.stream.seek(0, i*hopLength);
            int32hash ^= IPv4DB.binary.read32();  // Read 'pointCount' number of blocks from various parts of the stream and XOR them together
        }
        return Math.abs(int32hash).toString(36);  // 6 char base-36 number string (possible characters are all alphanumeric: 0-9 + a-z)
    },

    lookupIP : function(ipString)
    {
        if (ipString == "")
            return null;

        // IPv6 uses colons and IPv4 uses dots
        if (ipString.indexOf(':') == -1)
            return searchDB( IPv4DB, IPv4StringToInteger(ipString) );  // Look up normal IPv4 address

        if (ipString == "::1")  // IPv6 Localhost (prefix is zero, so can't use IPv6 prefix DB)
            return "-L";

        var ip = { str : ipString };
        if (!parseIPv6(ip))  // Extracts a 32-bit IPv4 address or a 48-bit IPv6 prefix
            return null;

        if (ip.IPv4address)  // Successfully extracted an IPv4 address from this IPv6 address to look up in the IPv4 DB
            return searchDB( IPv4DB, ip.IPv4address );

        return searchDB( IPv6DB, ip.IPv6prefix );  // Look up normal IPv6 address prefix
    }
};

function loadIPDBfile(db,file)
{
    if (db.stream != undefined)
        throw "Tried to load " + db.type + " DB twice!";

    if (!file.exists())
        throw db.type + " DB file not found (" + file.path + ")";

    // Open an input stream for file
    db.stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                          .createInstance(Components.interfaces.nsIFileInputStream)
                          .QueryInterface(Components.interfaces.nsISeekableStream);
    db.stream.init(file, 0x01, 0444, 0);  // read-only, read by owner/group/others, normal behavior
    if (!db.stream.available())
        throw db.type + " DB file failed to load (" + file.path + ")";

    if (db.stream.available() != IPDBmetadata.size[db.type])
        throw db.type + " DB file is corrupt (got " + db.stream.available() + " bytes but expected " + IPDBmetadata.size[db.type] + " bytes)";

    // Reading binary needs a helper interface
    db.binary = Components.classes["@mozilla.org/binaryinputstream;1"]
                          .createInstance(Components.interfaces.nsIBinaryInputStream);
    db.binary.setInputStream(db.stream);
    db.readInt = (db.bytesPerInt==4) ? db.binary.read32 : function() { return read48(db.binary); } ;

    db.entryCount = db.stream.available() / (db.bytesPerInt+2);  // +2 for country code
    db.countryCodesOffset = db.entryCount * db.bytesPerInt;
    if (Math.floor(db.entryCount) != db.entryCount)
        throw db.type + " DB file is bad (got " + db.entryCount + " entries in " + db.stream.available() + " bytes but metadata agreed)";
}

function closeIPDBfile(db)
{
    if (db.stream)
    {
        db.stream.close();
        db.stream = null;
        db.binary = null;
        db.readInt = null;
    }
}

function IPv4StringToInteger(ipString)
{
    const octets = ipString.split(".");
    return (16777216 * parseInt(octets[0])) + (65536 * parseInt(octets[1])) + (256 * parseInt(octets[2])) + parseInt(octets[3]);
}

function hexStringToInteger(string)
{
    return parseInt(string, 16);
}

function read48(binary)  // Reads 48 bits from a binary input stream (JS can't handle full 64-bit numbers)
{
    return (4294967296 * binary.read16()) + binary.read32();
}

function expandIPv6String(ipString)  // Expands an IPv6 shorthand string into its full long version (32 char hex string)
{
    var blocks = ipString.split(':');
    for (var i=0; i<blocks.length; i++)
    {
        if (blocks[i].length == 0)  // Expand collapsed zeroes block
        {
            blocks[i] = "0000";
            while (blocks.length < 8)
                blocks.splice(i,0,"0000");
        }
        while (blocks[i].length < 4)  // Add leading zeroes as needed
            blocks[i] = "0" + blocks[i];
    }
    return blocks.join("");  // Drop ':' notation
}

function parseIPv6(ipObj)  // Returns true on successful parse and false on failure; parsed results are added to input object
{
    function setIPv4address(int32)
    {
        if (!int32)
            return false;
        ipObj.IPv4address = int32;
        return true;
    }
    function setIPv6prefix(int48)
    {
        if (!int48)
            return false;
        ipObj.IPv6prefix = int48;
        return true;
    }

    var ipString = ipObj.str.toLowerCase();

    if (ipString.indexOf('.') != -1)  // IPv4 address embedded in an IPv6 address using mixed notation
    {
        if (ipString.substr(0,7) == "::ffff:")  // IPv4 mapped embedded IPv6 address using "::ffff:" prefix
            return setIPv4address( IPv4StringToInteger(ipString.substr(7)) );
        if (ipString.substr(0,2) == "::")  // IPv4 compatible embedded IPv6 address using "::" prefix
            return setIPv4address( IPv4StringToInteger(ipString.substr(2)) );
        return false;  // Invalid mixed notation
    }

    ipString = expandIPv6String(ipString);  // Full IPv6 notation in use; expand all shorthand to full 32 char hex string

    // Try IPv4 embedded IPv6 addresses not using mixed notation
    if (ipString.substr(0,20) == "00000000000000000000")
    {
        var block6 = ipString.substr(20,4);
        if (block6 == "ffff" || block6 == "0000")
            return setIPv4address( hexStringToInteger(ipString.substr(24,8)) );
        return false;  // IPv6 prefix is zero (reserved/special IP range)
    }

    // Try IPv4 tunneling addresses
    if (ipString.substr(0,4) == "2002")  // "6to4" type -> next 32-bits is IPv4 address
        return setIPv4address( hexStringToInteger(ipString.substr(4,8)) );
    if (ipString.substr(0,8) == "20010000")  // "Teredo" type -> bitwise not of last 32-bits is IPv4 address
        return setIPv4address( ~hexStringToInteger(ipString.substr(24,8)) );

    // Normal IPv6 address with no IPv4 counterpart
    return setIPv6prefix( hexStringToInteger(ipString.substr(0,12)) );
}

function searchDB(db,int)  // Returns country code for integer in given DB, or null if not found
{
    function seekTo(i)
    {
        db.stream.seek(0, i*db.bytesPerInt);
    }

    function readCountryCode(i)  // Reads country code at given index
    {
        db.stream.seek(0, db.countryCodesOffset + i*2);
        var code = String.fromCharCode( db.binary.read8(), db.binary.read8() );  // Country code (2 char string)
        return code == "??" ? null : code ;  // "??" is code for a gap in the list
    }

    function binarySearch(low, high)
    {
        if (low > high)
            return null;

        var middle = Math.floor((low + high) / 2);
        seekTo(middle);

        if (int < db.readInt())
            return binarySearch(low, middle-1);
        if (int >= db.readInt())  // The next number is the start of the next range; not part of this range
            return binarySearch(middle+1, high);

        return readCountryCode(middle);  // range1start <= int && int < range2start
    }

    try { return binarySearch(0, db.entryCount); }
    catch (e) { return null; }
}

import GLib from "gi://GLib?version=2.0";
import Gio from "gi://Gio?version=2.0";
import Soup from "gi://Soup?version=3.0";
import { IWallhavenResponse, IWallhavenSearchOptions } from "../types/fetch";

const buildUrlQuery = (params: { [k: string]: string }) => {
    const query = new GLib.String("");
    const keys = Object.keys(params);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = params[key];

        if (value === null || value === undefined) {
            continue;
        }

        query.append(key);
        query.append("=");
        query.append(value);

        if (i < keys.length - 1) {
            query.append("&");
        }
    }

    return query.str;
};

export const fetchSearchResults = async (searchOptions: IWallhavenSearchOptions, cancellable: Gio.Cancellable) => {
    const { q, categories, order, page, sorting } = searchOptions;

    const scheme = "https";
    const host = "wallhaven.cc";
    const port = 443;
    const path = "/api/v1/search";
    const query = buildUrlQuery({
        q,
        categories,
        sorting,
        order,
        page,
    });

    const uri = GLib.Uri.build(GLib.UriFlags.NONE, scheme, null, host, port, path, query, null);
    const session = new Soup.Session();
    const message = new Soup.Message({ method: "GET", uri });

    const bytes = await session.send_and_read_async(message, null, cancellable);
    const utf8Decoder = new TextDecoder();
    const utf8 = utf8Decoder.decode(bytes.toArray());
    const json = JSON.parse(utf8);

    return json as IWallhavenResponse;
};

export const fetchImage = async (url: string, cancellable: Gio.Cancellable) => {
    const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
    const session = new Soup.Session();
    const message = new Soup.Message({ method: "GET", uri });

    const bytes = await session.send_and_read_async(message, null, cancellable);
    return bytes;
};

export const handleCatch = (error: unknown): null => {
    console.warn("[Wallhub] Error caught!");
    console.error(error);
    return null;
};
